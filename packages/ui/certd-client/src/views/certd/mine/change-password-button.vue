<template>
  <a-button v-if="showButton" type="primary" @click="open">
    {{ $t("passwordForm.changePasswordButton") }}
  </a-button>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
import { CrudOptions, useColumns, useFormWrapper } from "@fast-crud/fast-crud";
import * as api from "/@/views/certd/mine/api";
import { notification } from "ant-design-vue";
import { useUserStore } from "/@/store/user";

defineProps<{
  showButton: boolean;
}>();

let passwordFormRef = ref();

const validatePass1 = async (rule: any, value: any) => {
  if (value === "") {
    throw new Error(t("passwordForm.enterPassword"));
  }
  const formData = passwordFormRef.value.getFormData();
  if (formData.confirmNewPassword !== "") {
    passwordFormRef.value.formRef.formRef.validateFields(["confirmNewPassword"]);
  }
  if (formData.password === formData.newPassword) {
    throw new Error(t("passwordForm.newPasswordNotSameOld"));
  }
};
const validatePass2 = async (rule: any, value: any) => {
  if (value === "") {
    throw new Error(t("passwordForm.enterPasswordAgain"));
  } else if (value !== passwordFormRef.value.getFormData().newPassword) {
    throw new Error(t("passwordForm.passwordsNotMatch"));
  }
};

const userStore = useUserStore();
const { openDialog } = useFormWrapper();
const { buildFormOptions } = useColumns();
const passwordFormOptions: CrudOptions = {
  form: {
    col: {
      span: 24,
    },
    wrapper: {
      title: t("passwordForm.title"),
      width: "500px",
    },
    async doSubmit({ form }) {
      await api.changePassword(form);
      //重新加载用户信息
      await userStore.loadUserInfo();
    },
    async afterSubmit() {
      notification.success({ message: t("passwordForm.successMessage") });
    },
  },
  columns: {
    password: {
      title: t("passwordForm.oldPassword"),
      type: "password",
      form: {
        rules: [{ required: true, message: t("passwordForm.oldPasswordRequired") }],
      },
    },
    newPassword: {
      title: t("passwordForm.newPassword"),
      type: "password",
      form: {
        rules: [
          { required: true, message: t("passwordForm.newPasswordRequired") },
          //@ts-ignore
          { validator: validatePass1, trigger: "blur" },
        ],
      },
    },
    confirmNewPassword: {
      title: t("passwordForm.confirmNewPassword"),
      type: "password",
      form: {
        rules: [
          {
            required: true,
            message: t("passwordForm.confirmNewPasswordRequired"),
          },
          //@ts-ignore
          { validator: validatePass2, trigger: "blur" },
        ],
      },
    },
  },
};

async function open(opts: { password: "" }) {
  const formOptions = buildFormOptions(passwordFormOptions);
  formOptions.newInstance = true; //新实例打开
  passwordFormRef.value = await openDialog(formOptions);
  passwordFormRef.value.setFormData({
    password: opts.password,
  });
  console.log(passwordFormRef.value);
}

const scope = ref({
  open: open,
});

defineExpose(scope.value);
</script>
