import { AddonInput, BaseAddon, IsAddon } from "@certd/lib-server";
import { IOauthProvider, OnBindReq, OnCallbackReq } from "../api.js";

@IsAddon({
  addonType: "oauth",
  name: 'oidc',
  title: 'OpenId connect 认证',
  desc: '',
  showTest: false,
})
export class OidcOauthProvider extends BaseAddon implements IOauthProvider {

  @AddonInput({
    title: "ClientId",
    helper: "ClientId / appId",
    required: true,
  })
  clientId = "";

  @AddonInput({
    title: "ClientSecretKey",
    component: {
      placeholder: "ClientSecretKey / appSecretKey",
    },
    required: true,
  })
  clientSecretKey = "";

  @AddonInput({
    title: "服务地址",
    helper: "Issuer地址",
    component: {
      placeholder: "https://oidc.example.com/oidc",
    },
    required: true,
  })
  issuerUrl = "";


  async getClient() {
    const client = await import('openid-client')
    let server = new URL(this.issuerUrl)// Authorization Server's Issuer Identifier

    let config = await client.discovery(
      server,
      this.clientId,
      this.clientSecretKey,
    )

    // console.log(config.serverMetadata())

    return {
      config,
      client
    }
  }

  async onCallback(req: OnCallbackReq) {
    const { config, client } = await this.getClient()

    const currentUrl = new URL("")
    let tokens: any = await client.authorizationCodeGrant(
      config,
      currentUrl,
      {
        pkceCodeVerifier: req.code,
        expectedState: req.state,
      },
    )

    console.log('Token Endpoint Response', tokens)
    const claims = tokens.claims()
    return {
      token:{
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresIn: tokens.expires_in,
      },
      userInfo: {
        openId: claims.sub,
        nickName: claims.nickname,
        avatar: claims.picture,
      },
    }
  };
  async onBind(req: OnBindReq) {
    return {
      success: false,
      message: '绑定失败',
    }
  }
  async buildLoginUrl(params: { redirectUri: string }) {
    const { config, client } = await this.getClient()

    let redirect_uri = new URL(params.redirectUri)
    let scope = 'openid profile' // Scope of the access request
    /**
     * PKCE: The following MUST be generated for every redirect to the
     * authorization_endpoint. You must store the code_verifier and state in the
     * end-user session such that it can be recovered as the user gets redirected
     * from the authorization server back to your application.
     */
    let code_verifier = client.randomPKCECodeVerifier()
    let code_challenge = await client.calculatePKCECodeChallenge(code_verifier)
    let state = client.randomState()

    let parameters: any = {
      redirect_uri,
      scope,
      code_challenge,
      code_challenge_method: 'S256',
      state,
    }

    // if (!config.serverMetadata().supportsPKCE()) {
    //     /**
    //      * We cannot be sure the server supports PKCE so we're going to use state too.
    //      * Use of PKCE is backwards compatible even if the AS doesn't support it which
    //      * is why we're using it regardless. Like PKCE, random state must be generated
    //      * for every redirect to the authorization_endpoint.
    //      */
    //     parameters.state = client.randomState()
    // }

    let redirectTo = client.buildAuthorizationUrl(config, parameters)

    // now redirect the user to redirectTo.href
    console.log('redirecting to', redirectTo.href)
    return redirectTo.href;
  }
}
