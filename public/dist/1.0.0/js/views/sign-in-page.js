import {
  AuthServiceComponent
} from "../chunk-YXQPF4O3.js";
import {
  DEFAULT_LANGUAGE,
  context,
  loadContent,
  navigateHandler,
  routeNavigator
} from "../chunk-XRG75RSX.js";
import {
  __publicField
} from "../chunk-U3RQVIYY.js";

// src/client/views/pages/sign-in-page.ts
var _SignInPage = class {
  lang = DEFAULT_LANGUAGE;
  node = null;
  titleElem = null;
  emailInputElem = null;
  passwordInputElem = null;
  passwordLabelElem = null;
  signUpBtn = null;
  signInBtn = null;
  cancelBtn = null;
  authService = null;
  signUpBtnClickHandler;
  cancelBtnClickHandler;
  formSubmitHandler;
  static get instance() {
    if (!_SignInPage.page) {
      _SignInPage.page = new _SignInPage();
    }
    return _SignInPage.page;
  }
  constructor() {
    this.formSubmitHandler = async (event) => {
      event.preventDefault();
      const form = this.node?.querySelector(".main-card form");
      const data = new FormData(form);
      const params = new URLSearchParams();
      data.forEach((value, key) => {
        params.append(key, value.toString());
      });
      try {
        const response = await fetch(`${location.pathname}?ajax=1`, {
          method: "post",
          body: params
        });
        if (response.status === 200) {
          const resData = await response.json();
          if (resData.status === "OK" /* OK */) {
            routeNavigator.redirectTo((this.lang === DEFAULT_LANGUAGE ? "" : `/${this.lang}`) + "/");
          } else {
            console.error(resData.data);
          }
        }
      } finally {
      }
    };
    this.signUpBtnClickHandler = (event) => navigateHandler(event, this.signUpBtn);
    this.cancelBtnClickHandler = (event) => navigateHandler(event, this.cancelBtn);
  }
  get elem() {
    return this.node;
  }
  async init(parent, firstTime) {
    let content = await loadContent(parent, firstTime, []);
    this.node = content.querySelector('[data-page="signin-page"]') || null;
    const form = this.node?.querySelector(".main-card form");
    this.titleElem = this.node?.querySelector('[data-title="main"]') || null;
    this.emailInputElem = form?.querySelector("#email") || null;
    this.passwordInputElem = form?.querySelector("#password") || null;
    this.passwordLabelElem = form?.querySelector("#password-label") || null;
    this.signUpBtn = form?.querySelector('[data-button="sign-up"]') || null;
    this.signInBtn = form?.querySelector('[data-button="sign-in"]') || null;
    this.cancelBtn = form?.querySelector('[data-button="cancel"]') || null;
    this.authService = new AuthServiceComponent();
    await this.authService.init(this, firstTime);
    return content;
  }
  async mount() {
    const form = this.node?.querySelector(".main-card form");
    form?.addEventListener("submit", this.formSubmitHandler);
    this.signUpBtn?.addEventListener("click", this.signUpBtnClickHandler);
    this.cancelBtn?.addEventListener("click", this.cancelBtnClickHandler);
  }
  async unmount() {
    const form = this.node?.querySelector(".main-card form");
    form?.removeEventListener("submit", this.formSubmitHandler);
    this.signUpBtn?.removeEventListener("click", this.signUpBtnClickHandler);
    this.cancelBtn?.removeEventListener("click", this.cancelBtnClickHandler);
  }
  async load(lang, page, firstLoad) {
    this.lang = lang;
    if (this.titleElem) {
      this.titleElem.textContent = context.tr("Sign In");
    }
    if (this.passwordInputElem) {
      this.passwordInputElem.placeholder = context.tr("Password") + "*";
    }
    if (this.passwordLabelElem) {
      this.passwordLabelElem.textContent = context.tr("Password") + "*";
    }
    if (this.signUpBtn) {
      this.signUpBtn.textContent = context.tr("Sign Up");
    }
    if (this.signInBtn) {
      this.signInBtn.textContent = context.tr("Sign In");
    }
    if (this.cancelBtn) {
      this.cancelBtn.textContent = context.tr("Cancel");
    }
    this.signUpBtn?.setAttribute("href", (lang === DEFAULT_LANGUAGE ? "" : `/${lang}`) + "/sign-up");
    this.cancelBtn?.setAttribute("href", (lang === DEFAULT_LANGUAGE ? "" : `/${lang}`) + "/");
    await this.authService?.load?.(lang, page, firstLoad);
  }
};
var SignInPage = _SignInPage;
__publicField(SignInPage, "page", null);
export {
  SignInPage
};
//# sourceMappingURL=sign-in-page.js.map
