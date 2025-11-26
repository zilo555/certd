export type OnCallbackReq = {
    code: string;
    redirectUri: string;
    state: string;
}

export type OauthToken = {
    userInfo: {
        openId: string;
        nickName: string;
        avatar: string;
    },
    token: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }
}

export type OnBindReq = {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    idToken: string;
    scope: string;
    tokenType: string;
    bindInfo: any;
}
export type OnBindReply = {
    success: boolean;
    message: string;
}

export interface IOauthProvider {
    buildLoginUrl: (params: { redirectUri: string }) => Promise<string>;
    onCallback: (params: OnCallbackReq) => Promise<OauthToken>;
    onBind: (params: OnBindReq) => Promise<OnBindReply>;
}