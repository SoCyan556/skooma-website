import { reactive } from 'vue';

// Small shared UI state. downloadModal is the "Downloads disabled" popup shown from every download CTA.
export const ui = reactive({ downloadModal: false });
export const showDownloadModal = () => { ui.downloadModal = true; };
export const closeDownloadModal = () => { ui.downloadModal = false; };
