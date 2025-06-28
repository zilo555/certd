<template>
	<fs-page class="page-user-profile">
		<template #header>
			<div class="title">{{ t("certd.myInfo") }}</div>
		</template>
		<div class="p-10">
			<a-descriptions title="" bordered :column="1">
				<a-descriptions-item :label="t('authentication.username')">{{ userInfo.username }}</a-descriptions-item>
				<a-descriptions-item :label="t('authentication.avatar')">
					<a-avatar v-if="userInfo.avatar" size="large"
						:src="'api/basic/file/download?&key=' + userInfo.avatar" style="background-color: #eee">
					</a-avatar>
					<a-avatar v-else size="large" style="background-color: #00b4f5">
						{{ userInfo.username }}
					</a-avatar>
				</a-descriptions-item>
				<a-descriptions-item :label="t('authentication.nickName')">{{ userInfo.nickName }}</a-descriptions-item>
				<a-descriptions-item :label="t('authentication.email')">{{ userInfo.email }}</a-descriptions-item>
				<a-descriptions-item :label="t('authentication.phoneNumber')">{{ userInfo.phoneCode }}{{ userInfo.mobile
					}}</a-descriptions-item>
				<a-descriptions-item :label="t('authentication.changePassword')">
					<change-password-button :show-button="true"> </change-password-button>
				</a-descriptions-item>
			</a-descriptions>

		</div>
	</fs-page>
</template>



<script lang="ts" setup>
import * as api from "./api";
import { Ref, ref } from "vue";
import ChangePasswordButton from "/@/views/certd/mine/change-password-button.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineOptions({
	name: "UserProfile"
});

const userInfo: Ref = ref({});

const getUserInfo = async () => {
	userInfo.value = await api.getMineInfo();
};
getUserInfo();
</script>
