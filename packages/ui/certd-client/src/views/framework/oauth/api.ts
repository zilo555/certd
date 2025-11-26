import { request } from "/src/api/service";

const apiPrefix = "/oauth";

export async function OauthLogin(type: string) {
  return await request({
    url: apiPrefix + `/login`,
    method: "post",
    data: {
      type,
    },
  });
}

export async function OauthCallback(type: string, query: Record<string, string>) {
  return await request({
    url: apiPrefix + `/callback`,
    method: "post",
    data: {
      type,
      ...query,
    },
  });
}

export async function AutoRegister(type: string, code: string) {
  return await request({
    url: apiPrefix + `/autoRegister`,
    method: "post",
    data: {
      validationCode: code,
      type,
    },
  });
}

export async function BindUser(code: string) {
  return await request({
    url: apiPrefix + `/bind`,
    method: "post",
    data: {
      validationCode: code,
    },
  });
}
