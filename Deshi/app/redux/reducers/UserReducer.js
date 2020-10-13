import { TYPE_SAVE_LOGIN_DETAILS } from "../actions/User";

const initialStateUser = {
  // LOGIN DETAILS
  phoneNumberInRedux: undefined,
  userIdInRedux: undefined
};

export function userOperations(state = initialStateUser, action) {
  switch (action.type) {
    case TYPE_SAVE_LOGIN_DETAILS: {
      return Object.assign({}, state, {
        phoneNumberInRedux: action.value.PhoneNumber,
        userIdInRedux: action.value.UserID
      });
    }
    // case SAVE_CART_COUNT: {
    //   return Object.assign({}, state, {
    //     cartCount: action.value
    //   });
    // }
    default:
      return state;
  }
}
