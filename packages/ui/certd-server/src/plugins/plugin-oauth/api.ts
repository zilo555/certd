export interface OauthProvider {
  buildLoginUrl: (params: { redirectUri: string }) => string;
  handleCallback: (params: { code: string; redirectUri: string }) => Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    idToken: string;
    scope: string;
    tokenType: string;
  }>;
  bind: (params: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    idToken: string;
    scope: string;
    tokenType: string;
    bindInfo: any;
  }) => Promise<{
    success: boolean;
    message: string;
  }>;
  
}