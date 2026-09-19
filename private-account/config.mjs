// Owner-only rules published and simulator isolation checks passed on 2026-09-19.
export const privateAccountEnabled = true;
// File storage needs a provisioned bucket, billing, tested rules and CORS.
export const privateDocumentsEnabled = false;
export const firebaseConfig = {
  apiKey: 'AIzaSyAa5nAU4yfy3CKQN_1qvUsmt7Ng2kTc2S4',
  authDomain: 'eye-of-garden.firebaseapp.com',
  projectId: 'eye-of-garden',
  storageBucket: 'eye-of-garden.firebasestorage.app',
  messagingSenderId: '1043903336556',
  appId: '1:1043903336556:web:9374e611a5bd487793c849'
};

// Activate after the additional doctor-sharing rules are approved and tested.
export const doctorSharingEnabled = false;
