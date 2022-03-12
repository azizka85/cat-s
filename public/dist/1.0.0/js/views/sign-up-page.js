import {
  AuthServiceComponent
} from "../chunk-YXQPF4O3.js";
import {
  DEFAULT_LANGUAGE,
  context,
  loadContent,
  navigateHandler
} from "../chunk-XRG75RSX.js";
import {
  __publicField
} from "../chunk-U3RQVIYY.js";

// src/client/views/pages/sign-up-page.ts
var _SignUpPage = class {
  node = null;
  titleElem = null;
  emailInputElem = null;
  nameInputElem = null;
  nameLabelElem = null;
  passwordInputElem = null;
  passwordLabelElem = null;
  photoInputElem = null;
  photoLabelElem = null;
  signInBtn = null;
  signUpBtn = null;
  cancelBtn = null;
  authService = null;
  signInBtnClickHandler;
  cancelBtnClickHandler;
  formSubmitHandler;
  static get instance() {
    if (!_SignUpPage.page) {
      _SignUpPage.page = new _SignUpPage();
    }
    return _SignUpPage.page;
  }
  constructor() {
    this.formSubmitHandler = (event) => {
      event.preventDefault();
      const form = this.node?.querySelector(".main-card form");
      const data = new FormData(form);
      console.log("Form submited: ");
      data.forEach((value, key) => {
        console.log(key + ":", value);
      });
    };
    this.signInBtnClickHandler = (event) => navigateHandler(event, this.signInBtn);
    this.cancelBtnClickHandler = (event) => navigateHandler(event, this.cancelBtn);
  }
  get elem() {
    return this.node;
  }
  async init(parent, firstTime) {
    let content = await loadContent(parent, firstTime, []);
    this.node = content.querySelector('[data-page="signup-page"]') || null;
    const form = this.node?.querySelector(".main-card form");
    this.titleElem = this.node?.querySelector('[data-title="main"]') || null;
    this.emailInputElem = form?.querySelector("#email") || null;
    this.nameInputElem = form?.querySelector("#name") || null;
    this.nameLabelElem = form?.querySelector("#name-label") || null;
    this.passwordInputElem = form?.querySelector("#password") || null;
    this.passwordLabelElem = form?.querySelector("#password-label") || null;
    this.photoInputElem = form?.querySelector("#photo") || null;
    this.photoLabelElem = form?.querySelector("#photo-label") || null;
    this.signInBtn = form?.querySelector('[data-button="sign-in"]') || null;
    this.signUpBtn = form?.querySelector('[data-button="sign-up"]') || null;
    this.cancelBtn = form?.querySelector('[data-button="cancel"]') || null;
    this.authService = new AuthServiceComponent();
    await this.authService.init(this, firstTime);
    return content;
  }
  async mount() {
    const form = this.node?.querySelector(".main-card form");
    form?.addEventListener("submit", this.formSubmitHandler);
    this.signInBtn?.addEventListener("click", this.signInBtnClickHandler);
    this.cancelBtn?.addEventListener("click", this.cancelBtnClickHandler);
  }
  async unmount() {
    const form = this.node?.querySelector(".main-card form");
    form?.removeEventListener("submit", this.formSubmitHandler);
    this.signInBtn?.removeEventListener("click", this.signInBtnClickHandler);
    this.cancelBtn?.removeEventListener("click", this.cancelBtnClickHandler);
  }
  async load(lang, page, firstLoad) {
    if (this.titleElem) {
      this.titleElem.textContent = context.tr("Sign Up");
    }
    if (this.nameInputElem) {
      this.nameInputElem.placeholder = context.tr("Name") + "*";
    }
    if (this.nameLabelElem) {
      this.nameLabelElem.textContent = context.tr("Name") + "*";
    }
    if (this.passwordInputElem) {
      this.passwordInputElem.placeholder = context.tr("Password") + "*";
    }
    if (this.passwordLabelElem) {
      this.passwordLabelElem.textContent = context.tr("Password") + "*";
    }
    if (this.photoLabelElem) {
      this.photoLabelElem.textContent = context.tr("Photo");
    }
    if (this.signInBtn) {
      this.signInBtn.textContent = context.tr("Sign In");
    }
    if (this.signUpBtn) {
      this.signUpBtn.textContent = context.tr("Sign Up");
    }
    if (this.cancelBtn) {
      this.cancelBtn.textContent = context.tr("Cancel");
    }
    this.signInBtn?.setAttribute("href", (lang === DEFAULT_LANGUAGE ? "" : `/${lang}`) + "/sign-in");
    this.cancelBtn?.setAttribute("href", (lang === DEFAULT_LANGUAGE ? "" : `/${lang}`) + "/");
    await this.authService?.load?.(lang, page, firstLoad);
  }
};
var SignUpPage = _SignUpPage;
__publicField(SignUpPage, "page", null);
export {
  SignUpPage
};
//# sourceMappingURL=sign-up-page.js.map
