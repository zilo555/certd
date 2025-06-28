<template>
	<fs-page class="page-setting-email">
		<template #header>
			<div class="title">
				{{ t('certd.emailServerSettings') }}
				<span class="sub">{{ t('certd.setEmailSendingServer') }}</span>
			</div>
		</template>

		<div class="flex-o">
			<a-form :model="formState" name="basic" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }"
				autocomplete="off" class="email-form-box" @finish="onFinish" @finish-failed="onFinishFailed">
				<div v-if="!formState.usePlus" class="email-form">
					<a-form-item :label="t('certd.useCustomEmailServer')"> </a-form-item>
					<a-form-item :label="t('certd.smtpDomain')" name="host"
						:rules="[{ required: true, message: t('certd.pleaseEnterSmtpDomain') }]">
						<a-input v-model:value="formState.host" />
					</a-form-item>

					<a-form-item :label="t('certd.smtpPort')" name="port"
						:rules="[{ required: true, message: t('certd.pleaseEnterSmtpPort') }]">
						<a-input v-model:value="formState.port" />
					</a-form-item>

					<a-form-item :label="t('certd.username')" :name="['auth', 'user']"
						:rules="[{ required: true, message: t('certd.pleaseEnterUsername') }]">
						<a-input v-model:value="formState.auth.user" />
					</a-form-item>
					<a-form-item :label="t('certd.password')" :name="['auth', 'pass']"
						:rules="[{ required: true, message: t('certd.pleaseEnterPassword') }]">
						<a-input-password v-model:value="formState.auth.pass" />
						<div class="helper">{{ t('certd.qqEmailAuthCodeHelper') }}</div>
					</a-form-item>
					<a-form-item :label="t('certd.senderEmail')" name="sender"
						:rules="[{ required: true, message: t('certd.pleaseEnterSenderEmail') }]">
						<a-input v-model:value="formState.sender" />
					</a-form-item>
					<a-form-item :label="t('certd.useSsl')" name="secure">
						<a-switch v-model:checked="formState.secure" />
						<div class="helper">{{ t('certd.sslPortNote') }}</div>
					</a-form-item>
					<a-form-item :label="t('certd.ignoreCertValidation')" :name="['tls', 'rejectUnauthorized']">
						<a-switch v-model:checked="formState.tls.rejectUnauthorized" />
					</a-form-item>

					<a-form-item :wrapper-col="{ offset: 8, span: 16 }">
						<a-button type="primary" html-type="submit">{{ t('certd.save') }}</a-button>
					</a-form-item>
				</div>
				<div class="email-form">
					<a-form-item :label="t('certd.useOfficialEmailServer')" name="usePlus">
						<div class="flex-o">
							<a-switch v-model:checked="formState.usePlus" :disabled="!settingStore.isPlus"
								@change="onUsePlusChanged" />
							<vip-button class="ml-5" mode="button"></vip-button>
						</div>
						<div class="helper">{{ t('certd.useOfficialEmailServerHelper') }}</div>
					</a-form-item>
				</div>
			</a-form>
		</div>
		<div class="email-form">
			<a-form :model="testFormState" name="basic" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }"
				autocomplete="off" @finish="onTestSend">
				<a-form-item :label="t('certd.testReceiverEmail')" name="receiver"
					:rules="[{ required: true, message: t('certd.pleaseEnterTestReceiverEmail') }]">
					<a-input v-model:value="testFormState.receiver" />
					<div class="helper">{{ t('certd.saveBeforeTest') }}</div>
					<div class="helper">{{ t('certd.sendFailHelpDoc') }}<a
							href="https://certd.docmirror.cn/guide/use/email/" target="_blank">{{
								t('certd.emailConfigHelpDoc') }}</a></div>
					<div class="helper">{{ t('certd.tryOfficialEmailServer') }}</div>
				</a-form-item>
				<a-form-item :wrapper-col="{ offset: 8, span: 16 }">
					<a-button type="primary" :loading="testFormState.loading" html-type="submit">{{ t('certd.test')
					}}</a-button>
				</a-form-item>
			</a-form>
		</div>
	</fs-page>
</template>


<script setup lang="ts">
import { reactive } from "vue";
import * as api from "../api";
import * as emailApi from "./api.email";
import { notification } from "ant-design-vue";
import { useSettingStore } from "/src/store/settings";
import * as _ from "lodash-es";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
defineOptions({
	name: "EmailSetting",
});

interface FormState {
	host: string;
	port: number;
	auth: {
		user: string;
		pass: string;
	};
	secure: boolean; // use TLS
	tls: {
		// do not fail on invalid certs
		rejectUnauthorized?: boolean;
	};
	sender: string;
	usePlus: boolean;
}

const formState = reactive<Partial<FormState>>({
	auth: {
		user: "",
		pass: "",
	},
	tls: {},
	usePlus: false,
});

async function load() {
	const data: any = await api.EmailSettingsGet();
	_.merge(formState, data);
}

load();

const onFinish = async (form: any) => {
	console.log("Success:", form);
	await api.EmailSettingsSave(form);
	notification.success({
		message: t("certd.saveSuccess"),
	});
};


const onFinishFailed = (errorInfo: any) => {
	// console.log("Failed:", errorInfo);
};

async function onUsePlusChanged() {
	await api.EmailSettingsSave(formState);
}

interface TestFormState {
	receiver: string;
	loading: boolean;
}
const testFormState = reactive<TestFormState>({
	receiver: "",
	loading: false,
});
async function onTestSend() {
	testFormState.loading = true;
	try {
		await emailApi.TestSend(testFormState.receiver);
		notification.success({
			message: t("certd.sendSuccess"),
		});
	} finally {
		testFormState.loading = false;
	}
}


const settingStore = useSettingStore();
</script>

<style lang="less">
.page-setting-email {
	.email-form-box {
		display: flex;
	}

	.email-form {
		width: 500px;
		margin: 20px;
	}

	.helper {
		padding: 1px;
		margin: 0px;
		color: #999;
		font-size: 10px;
	}
}
</style>
