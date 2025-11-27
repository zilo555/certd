export type OnCallbackReq = {
    code: string;
    state: string;
    currentURL: URL;
    ticketValue: any;
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

export type LoginUrlReply = {
    loginUrl: string;
    ticketValue: any;
}

export interface IOauthProvider {
    buildLoginUrl: (params: { redirectUri: string }) => Promise<LoginUrlReply>;
    onCallback: (params: OnCallbackReq) => Promise<OauthToken>;
}