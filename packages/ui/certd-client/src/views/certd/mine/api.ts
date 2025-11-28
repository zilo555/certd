import { request } from "/src/api/service";

export async function getMineInfo() {
  return await request({
    url: "/mine/info",
    method: "POST",
  });
}

export async function changePassword(form: any) {
  return await request({
    url: "/mine/changePassword",
    method: "POST",
    data: form,
  });
}

export async function UpdateProfile(form: any) {
  return await request({
    url: "/mine/updateProfile",
    method: "POST",
    data: form,
  });
}

export async function GetOauthBounds() {
  return await request({
    url: "/oauth/bounds",
    method: "POST",
  });
}

export async function GetOauthProviders() {
  return await request({
    url: "/oauth/providers",
    method: "POST",
  });
}

export async function UnbindOauth(type: string) {
  return await request({
    url: "/oauth/unbind",
    method: "POST",
    data: { type },
  });
}

export async function OauthBoundUrl(type: string) {
  return await request({
    url: "/oauth/login",
    method: "POST",
    data: {
      type,
      forType: "bind",
    },
  });
}
