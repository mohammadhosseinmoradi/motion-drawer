import { createContext, RefObject, use } from "react";
import { match } from "@/utils/match";

type DrawerState = {};

type DrawerActions = {};

export const DrawerContext = createContext<
  | ({
      // These are part of the context but not part of the state to be dispatched
      drawerRef: RefObject<HTMLElement | null>;
      headerRef: RefObject<HTMLElement | null>;
      bodyRef: RefObject<HTMLElement | null>;
      actionsRef: RefObject<HTMLElement | null>;
      maxSize: number;
      isDrawerMaxSize: boolean;
    } & DrawerState &
      DrawerActions)
  | null
>(null);

export function useDrawerContext() {
  const context = use(DrawerContext);
  if (context === null) {
    const error = new Error(
      "useDrawerContext must be used within a <DrawerContext>",
    );
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, useDrawerContext);
    }
    throw error;
  }
  return context;
}

export enum ActionTypes {
  test,
}

type Actions = {
  type: ActionTypes.test;
};

const reducers: {
  [P in ActionTypes]: (
    state: DrawerState,
    action: Extract<Actions, { type: P }>,
  ) => DrawerState;
} = {
  [ActionTypes.test](state) {
    return state;
  },
};

export const stateReducer = (state: DrawerState, action: Actions) => {
  return match(action.type, reducers, state, action);
};
