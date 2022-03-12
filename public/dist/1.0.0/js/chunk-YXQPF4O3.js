import {
  DEFAULT_LANGUAGE,
  context
} from "./chunk-XRG75RSX.js";

// src/client/views/components/auth-service-component.ts
var AuthServiceComponent = class {
  titleElem = null;
  githubBtn = null;
  async init(view, firstTime) {
    this.titleElem = view.elem?.querySelector('[data-title="auth-service"]') || null;
    this.githubBtn = view.elem?.querySelector('[data-button="auth-service-github"]') || null;
  }
  async load(lang, page, firstLoad) {
    if (this.titleElem) {
      this.titleElem.textContent = context.tr("Or use the service");
    }
    const langQuery = lang === DEFAULT_LANGUAGE ? "" : `?lang=${lang}`;
    if (this.githubBtn) {
      this.githubBtn.setAttribute("href", `/auth/service/github${langQuery}`);
    }
  }
};

export {
  AuthServiceComponent
};
//# sourceMappingURL=chunk-YXQPF4O3.js.map
