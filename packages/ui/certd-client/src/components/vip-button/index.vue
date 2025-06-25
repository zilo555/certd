<template>
	<div v-if="!settingStore.isComm || userStore.isAdmin" class="layout-vip isPlus" @click="openUpgrade">
		<contextHolder />
		<fs-icon icon="mingcute:vip-1-line" :title="text.title" />

		<div v-if="mode !== 'icon'" class="text hidden md:block ml-0.5">
			<a-tooltip>
				<template #title> {{ text.title }}</template>
				<span class="">{{ text.name }}</span>
			</a-tooltip>
		</div>
	</div>
</template>
<script lang="tsx" setup>
import { computed, onMounted, reactive } from "vue";
import dayjs from "dayjs";
import { message, Modal } from "ant-design-vue";
import * as api from "./api";
import { useSettingStore } from "/@/store/settings";
import { useRouter } from "vue-router";
import { useUserStore } from "/@/store/user";
import { mitter } from "/@/utils/util.mitt";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const settingStore = useSettingStore();
const props = withDefaults(
  defineProps<{
    mode?: "comm" | "button" | "nav" | "icon";
  }>(),
  {
    mode: "button",
  }
);
type Text = {
  name: string;
  title?: string;
};
const text = computed<Text>(() => {
  const vipLabel = settingStore.vipLabel;
  const map = {
    isComm: {
      comm: {
        name: t("vip.comm.name", { vipLabel }),
        title: t("vip.comm.title", { expire: expireTime.value }),
      },
      button: {
        name: t("vip.comm.name", { vipLabel }),
        title: t("vip.comm.title", { expire: expireTime.value }),
      },
      icon: {
        name: "",
        title: t("vip.comm.name", { vipLabel }),
      },
      nav: {
        name: t("vip.comm.nav", { vipLabel }),
        title: t("vip.comm.title", { expire: expireTime.value }),
      },
    },
    isPlus: {
      comm: {
        name: t("vip.plus.name"),
        title: t("vip.plus.title"),
      },
      button: {
        name: t("vip.comm.name", { vipLabel }),
        title: t("vip.comm.title", { expire: expireTime.value }),
      },
      icon: {
        name: "",
        title: t("vip.comm.name", { vipLabel }),
      },
      nav: {
        name: t("vip.comm.nav", { vipLabel }),
        title: t("vip.comm.title", { expire: expireTime.value }),
      },
    },
    free: {
      comm: {
        name: t("vip.free.comm.name"),
        title: t("vip.free.comm.title"),
      },
      button: {
        name: t("vip.free.button.name"),
        title: t("vip.free.button.title"),
      },
      icon: {
        name: "",
        title: t("vip.free.button.name"),
      },
      nav: {
        name: t("vip.free.nav.name"),
        title: t("vip.free.nav.title"),
      },
    },
  };
  if (settingStore.isComm) {
    return map.isComm[props.mode];
  } else if (settingStore.isPlus) {
    return map.isPlus[props.mode];
  } else {
    return map.free[props.mode];
  }
});


const expireTime = computed(() => {
  if (settingStore.isPlus) {
    return dayjs(settingStore.plusInfo.expireTime).format("YYYY-MM-DD");
  }
  return "";
});

const expiredDays = computed(() => {
  if (settingStore.plusInfo?.isPlus && !settingStore.isPlus) {
    //已过期多少天
    const days = dayjs().diff(dayjs(settingStore.plusInfo.expireTime), "day");
    return `${settingStore.vipLabel}已过期${days}天`;
  }
  return "";
});

const formState = reactive({
  code: "",
  inviteCode: "",
});

const router = useRouter();
async function doActive() {
  if (!formState.code) {
    message.error(t("vip.enterCode"));
    throw new Error(t("vip.enterCode"));
  }
  const res = await api.doActive(formState);
  if (res) {
    await settingStore.init();
    const vipLabel = settingStore.vipLabel;
    Modal.success({
      title: t("vip.successTitle"),
      content: t("vip.successContent", {
        vipLabel,
        expireDate: dayjs(settingStore.plusInfo.expireTime).format("YYYY-MM-DD"),
      }),
      onOk() {
        if (!(settingStore.installInfo.bindUserId > 0)) {
          Modal.confirm({
            title: t("vip.bindAccountTitle"),
            content: t("vip.bindAccountContent"),
            onOk() {
              router.push("/sys/account");
            },
          });
        }
      },
    });
  }
}


const computedSiteId = computed(() => settingStore.installInfo?.siteId);
const [modal, contextHolder] = Modal.useModal();
const userStore = useUserStore();

function goAccount() {
  Modal.destroyAll();
  router.push("/sys/account");
}

async function getVipTrial() {
  const res = await api.getVipTrial();
  message.success(t('vip.congratulations_vip_trial', { duration: res.duration }));
  await settingStore.init();
}


function openTrialModal() {
  Modal.destroyAll();

  modal.confirm({
    title: t('vip.trial_modal_title'),
    okText: t('vip.trial_modal_ok_text'),
    onOk() {
      getVipTrial();
    },
    width: 600,
    content: () => {
      return (
        <div class="flex-col mt-10 mb-10">
          <div>{t('vip.trial_modal_thanks')}</div>
          <div>{t('vip.trial_modal_click_confirm')}</div>
        </div>
      );
    },
  });
}


function openStarModal() {
  Modal.destroyAll();
  const goGithub = () => {
    window.open("https://github.com/certd/certd/");
  };

  modal.confirm({
    title: t("vip.get_7_day_pro_trial"),
    okText: t("vip.star_now"),
    onOk() {
      goGithub();
      openTrialModal();
    },
    width: 600,
    content: () => {
      return (
        <div class="flex mt-10 mb-10">
          <div>{t("vip.please_help_star")}</div>
          <img class="ml-5" src="https://img.shields.io/github/stars/certd/certd?logo=github" />
        </div>
      );
    },
  });
}


function openUpgrade() {
if (!userStore.isAdmin) {
  message.info(t("vip.admin_only_operation"));
  return;
}
const placeholder = t("vip.enter_activation_code");
const isPlus = settingStore.isPlus;
let title = t("vip.activate_pro_business");
if (settingStore.isComm) {
  title = t("vip.renew_business");
} else if (settingStore.isPlus) {
  title = t("vip.renew_pro_upgrade_business");
}


const productInfo = settingStore.productInfo;
const vipTypeDefine = {
  free: {
    title: t("vip.basic_edition"),
    desc: t("vip.community_free_version"),
    type: "free",
    icon: "lucide:package-open",
    privilege: [
      t("vip.unlimited_certificate_application"),
      t("vip.unlimited_domain_count"),
      t("vip.unlimited_certificate_pipelines"),
      t("vip.common_deployment_plugins"),
      t("vip.email_webhook_notifications"),
    ],
  },
  plus: {
    title: t("vip.professional_edition"),
    desc: t("vip.open_source_support"),
    type: "plus",
    privilege: [
      t("vip.vip_group_priority"),
      t("vip.unlimited_site_certificate_monitoring"),
      t("vip.more_notification_methods"),
      t("vip.plugins_fully_open"),
    ],
    trial: {
      title: t("vip.click_to_get_7_day_trial"),
      click: () => {
        openStarModal();
      },
    },
    icon: "stash:thumb-up",
    price: productInfo.plus.price,
    price3: `¥${productInfo.plus.price3}/3${t("vip.years")}`,
    tooltip: productInfo.plus.tooltip,
    get() {
      return (
        <a-tooltip title={t("vip.afdian_support_vip")}>
          <a-button size="small" type="primary" href="https://afdian.com/a/greper" target="_blank">
            {t("vip.get_after_support")}
          </a-button>
        </a-tooltip>
      );
    },
  },
  comm: {
    title: t("vip.business_edition"),
    desc: t("vip.commercial_license"),
    type: "comm",
    icon: "vaadin:handshake",
    privilege: [
      t("vip.all_pro_privileges"),
      t("vip.allow_commercial_use_modify_logo_title"),
      t("vip.data_statistics"),
      t("vip.plugin_management"),
      t("vip.unlimited_multi_users"),
      t("vip.support_user_payment"),
    ],
    price: productInfo.comm.price,
    price3: `¥${productInfo.comm.price3}/3${t("vip.years")}`,
    tooltip: productInfo.comm.tooltip,
    get() {
      return <a-button size="small">{t("vip.contact_author_for_trial")}</a-button>;
    },
  },
};


const modalRef = modal.confirm({
  title,
  async onOk() {
    return await doActive();
  },
  maskClosable: true,
  okText: t("vip.activate"),
  width: 1000,
  content: () => {
    let activationCodeGetWay = (
      <span>
        <a href="https://afdian.com/a/greper" target="_blank">
          {t("vip.get_pro_code_after_support")}
        </a>
        <span> {t("vip.business_contact_author")}</span>
      </span>
    );
    const vipLabel = settingStore.vipLabel;
    const slots = [];
    for (const key in vipTypeDefine) {
      // @ts-ignore
      const item = vipTypeDefine[key];
      const vipBlockClass = `vip-block ${key === settingStore.plusInfo.vipType ? "current" : ""}`;
      slots.push(
        <a-col span={8}>
          <div class={vipBlockClass}>
            <h3 class="block-header ">
              <span class="flex-o">{item.title}</span>
              {item.trial && (
                <span class="trial">
                  <a-tooltip title={item.trial.message}>
                    <a onClick={item.trial.click}>{item.trial.title}</a>
                  </a-tooltip>
                </span>
              )}
            </h3>
            <div style="color:green" class="flex-o">
              <fs-icon icon={item.icon} class="fs-16 flex-o" />
              {item.desc}
            </div>
            <ul class="flex-1 privilege">
              {item.privilege.map((p: string) => (
                <li class="flex-baseline">
                  <fs-icon class="color-green" icon="ion:checkmark-sharp" />
                  {p}
                </li>
              ))}
            </ul>
            <div class="footer flex-between flex-vc">
              <div class="price-show">
                {item.price && (
                  <span class="flex">
                    <span class="-text">¥{item.price}</span>
                    <span>/</span>
                    {t("vip.year")}
                    <a-tooltip class="ml-5" title={item.price3}>
                      <fs-icon class="pointer color-red" icon="ic:outline-discount"></fs-icon>
                    </a-tooltip>
                  </span>
                )}
                {!item.price && (
                  <span>
                    <span class="price-text">{t("vip.freee")}</span>
                  </span>
                )}
              </div>
              <div class="get-show">{item.get && <div>{item.get()}</div>}</div>
            </div>
          </div>
        </a-col>
      );
    }
    return (
      <div class="mt-10 mb-10 vip-active-modal">
        {productInfo.notice && (
          <div class="mb-10">
            <a-alert type="error" message={productInfo.notice}></a-alert>
          </div>
        )}
        <div class="vip-type-vs">
          <a-row gutter={20}>{slots}</a-row>
        </div>
        <div class="mt-10">
          <h3 class="block-header">{isPlus ? t("vip.renew") : t("vip.activate_immediately")}</h3>
          <div>
            {isPlus
              ? `${t("vip.current")} ${vipLabel} ${t("vip.activated_expire_time")}` +
                dayjs(settingStore.plusInfo.expireTime).format("YYYY-MM-DD")
              : ""}
          </div>
          <div class="mt-10">
            <div class="flex-o w-100">
              <span>{t("vip.site_id")}：</span>
              <fs-copyable class="flex-1" v-model={computedSiteId.value}></fs-copyable>
            </div>
            <a-input class="mt-10" v-model:value={formState.code} placeholder={placeholder} />
            <a-input
              class="mt-10"
              v-model:value={formState.inviteCode}
              placeholder={t("vip.invite_code_optional")}
            />
          </div>

          <div class="mt-10">
            {t("vip.no_activation_code")}
            {activationCodeGetWay}
          </div>
          <div class="mt-10">
            {t("vip.activation_code_one_use")}<a onClick={goAccount}>{t("vip.bind_account")}</a>
            ，{t("vip.transfer_vip")}
          </div>
        </div>
      </div>
    );
  },
});

}
onMounted(() => {
  mitter.on("openVipModal", () => {
    if (props.mode === "nav" && !settingStore.isPlus) {
      openUpgrade();
    }
  });
});
</script>

<style lang="less">
.layout-vip {
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;

	&.isPlus {
		color: #c5913f;
	}

	.text {}
}

.vip-active-modal {
	.vip-block {
		display: flex;
		flex-direction: column;
		padding: 10px;
		border: 1px solid #eee;
		border-radius: 5px;
		height: 250px;

		//background-color: rgba(250, 237, 167, 0.79);
		&.current {
			border-color: green;
		}

		.block-header {
			padding: 0px;
			display: flex;
			justify-content: space-between;

			.trial {
				font-size: 12px;
				font-wight: 400;
			}
		}

		.footer {
			padding-top: 5px;
			margin-top: 0px;
			border-top: 1px solid #eee;

			.price-text {
				font-size: 18px;
				color: red;
			}
		}
	}

	ul {
		list-style-type: unset;
		margin-left: 0px;
		padding: 0;
	}

	.color-green {
		color: green;
	}

	.vip-type-vs {
		.privilege {
			.fs-icon {
				color: green;
			}
		}

		.fs-icon {
			margin-right: 5px;
		}
	}
}
</style>
