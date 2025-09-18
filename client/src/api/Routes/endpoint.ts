

const API_URL = import.meta.env.VITE_API_URL;

export const API_ENDPOINTS = {
    AUTH: {
        SIGNUPUSER: `${API_URL}/auth/signup`,
        LOGINUSER: `${API_URL}/auth/login`,
        VERIFYEMAIL: `${API_URL}/auth/verify-email`,
        SENDFORGOTPASSWORDMAIL: `${API_URL}/auth/forgot-password`,
        FORGOTRESETPASSWORD: `${API_URL}/auth/forgot-resetPassword`,
        LOGOUTAPI: 'auth/logout'
    },
    BOOKING: {
        RECURRING_GET: `/recurring`, //GET
        RECURRING_POST: `/recurring`, //POST
        SLOT_POST: `/slot`, //POST
        SLOT_GET: `/slot`, //GET
        BOOKING_GET: `/booking`, //GET
        ADVOCATE_BOOKING_GET: `/booking/advocateBooking`, //GET
        BOOKING_POST: `/booking`, //POST
        BOOKING_POSTPONE: `/booking/postpone`,
        PAYMENT_CHECKOUT: '/payment/create-checkout-session',
        BOOKING_VERIFY: "/booking/verify",
        BOOKING_GETBOOK: '/booking/getBook',
        SLOT_PUT: `/slot`,
        HISTORY: '/booking/callHistory',
        BOOKING_CANCEL: '/booking/cancel'
    },
    ADMIN: {
        GET_ADMIN_ADVOCATES: "/admin/advocate/getAdvocates",
        SEND_VERIFICATION: '/admin/advocate/statusUpdate',
        USER_API: `/admin/user/getUsers`,
        DASHBOARD: `/adminDashboard`
    },
    NOTIFICATION: {
        NOTIFICATION_GET: `/notification`,
        NOTIFICATION_MARKASREAD: `/notification/markAsRead`,
        NOTIFICATION_MARKALLASREAD: `/notification/markAllAsRead`
    },
    ADVOCATE: {
        COMPLETE_PROFILE_DETAILS: `/advProfile/details`,
        UPDATE_PROFILE: `/advProfile/updateAdvProfile`,
        DASHBOARD: `/advocateDashboard`
    },
    REVIEW: {
        REVIEW_GET: '/review',
        REVIEW_POST: '/review',
        REVIEW_PUT: '/review',
        REVIEW_DELETE: '/review',
    },
    USER: {
        USER_ADVOCATES: `${API_URL}/user/advocates/getAdvocates`,
        USER_TOP_RATED: `${API_URL}/user/advocates/topRatedAdvocates`,
        FIND_USER: `/advProfile/getUser`,
        UPDATE_USER: `/advProfile/updateAdvocate`,
        TOGGLE_USER: '/user/toggleUser',
        RESET_PASSWORD: 'user/resetPassword',
        TOGGLE_SAVE_ADVOCATE: `/user/toggleSave`,
        GET_SAVED_ADVOCATES: '/user/savedAdvocates'
    },
    CASE: {
        CASE_POST: '/case',
        CASE_GET: '/case',
        CASE_PUT: '/case',
        CASE_DELETE: '/case',
        CASE_UPDATE_HEARING: `/case/updateHearing`,
        CASE_ADD_HEARING_DATA: '/case/addHearing',
        CASE_UPDATE_HEARING_DATA: '/case/updateHearingData',
        CASE_DELETE_HEARING_DATA: '/case/deleteHearing',
        CASE_GET_HEARING_DATA: '/case/getHearing',
    },
    CONVERSATION: {
        CONVERSATION_POST: '/conversation',
        CONVERSATION_GET: '/conversation',
        CONVERSATION_GET_MESSAGE: `/conversation/messages`,
    },
    SUBSCRIPTION: {
        SUBSCRIPTION_GET: '/subscribe',
        SUBSCRIPTION_GET_ALL: `/subscribe/getAll`,
        SUBSCRIPTION_POST: `/payment/create-subscription-checkout`,
    },
    FITLER: {
        GET_ALL_FILTER: '/filter',
        ADD_FILTER: '/filter',
        ADD_CATEGORY: '/filter',
        DELETE_FILTER: '/filter',
        DELETE_CAREGORY: '/filter/category'
    },
    WALLET: {
        GET_WALLET: '/wallet'
    }
}