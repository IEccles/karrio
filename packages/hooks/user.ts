import {
  UPDATE_USER,
  GET_USER,
  UpdateUserInput,
  RegisterUserMutationInput,
  RequestEmailChangeMutationInput,
  REGISTER_USER,
  CONFIRM_EMAIL_CHANGE,
  ConfirmEmailChangeMutationInput,
  CONFIRM_PASSWORD_RESET,
  ConfirmPasswordResetMutationInput,
  ChangePasswordMutationInput,
  GetUser,
  confirm_email_change,
  request_email_change,
  confirm_password_reset,
  register_user,
  change_password,
  update_user,
  REQUEST_EMAIL_CHANGE,
  ConfirmEmailMutationInput,
  confirm_email,
  CONFIRM_EMAIL,
  CHANGE_PASSWORD,
  RequestPasswordResetMutationInput,
  request_password_reset,
  REQUEST_PASSWORD_RESET,
} from "@karrio/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gqlstr, onError } from "@karrio/lib";
import { useKarrio, useKarrioLogin, setupRestClient } from "./karrio";

export function useUser() {
  const karrio = useKarrioLogin();

  const user = karrio.pageData?.user;

  // Queries
  const query = useQuery({
    queryKey: ["user"],
    queryFn: () => karrio.graphql.request<GetUser>(gqlstr(GET_USER)),
    initialData: user ? { user } : undefined,
    refetchOnWindowFocus: false,
    staleTime: 300000,
    enabled: !!karrio.graphql,
    onError: (error: Error) => {
      console.error("Failed to fetch user data:", error);
    },
  });

  return {
    query,
  };
}

export function useUserMutation() {
  const karrio = useKarrio();
  if (!karrio || !karrio.graphql) {
    console.error("useKarrio context is not properly initialized in useUserMutation:", karrio);
  }
  console.log('Karrio context:', karrio);
  console.log('Karrio graphql client:', karrio.graphql);

  const queryClient = useQueryClient();
  const invalidateCache = () => {
    queryClient.invalidateQueries(["user"]);
  };

  // Mutations
  const updateUser = useMutation(
    (data: UpdateUserInput) => {
      console.log("UpdateUser mutation data:", data);
      return karrio.graphql.request<update_user>(gqlstr(UPDATE_USER), { data });
    },
    { onSuccess: invalidateCache, onError },
  );

  const closeAccount = useMutation(
    () => {
      console.log("CloseAccount mutation");
      return karrio.graphql.request<update_user>(gqlstr(UPDATE_USER), {
        data: { is_active: false },
      });
    },
    { onSuccess: invalidateCache, onError },
  );

  const registerUser = useMutation(
    (data: RegisterUserMutationInput) => {
      console.log("RegisterUser mutation data:", data, REGISTER_USER);
      return karrio.graphql.request<register_user>(gqlstr(REGISTER_USER), { data });
    },
    { onSuccess: invalidateCache, onError },
  );

  const requestEmailChange = useMutation(
    (data: RequestEmailChangeMutationInput) => {
      console.log("RequestEmailChange mutation data:", data);
      return karrio.graphql.request<request_email_change>(
        gqlstr(REQUEST_EMAIL_CHANGE),
        { data },
      );
    },
    { onSuccess: invalidateCache, onError },
  );

  const confirmEmailChange = useMutation(
    (data: ConfirmEmailChangeMutationInput) => {
      console.log("ConfirmEmailChange mutation data:", data);
      return karrio.graphql.request<confirm_email_change>(
        gqlstr(CONFIRM_EMAIL_CHANGE),
        { data },
      );
    },
    { onSuccess: invalidateCache, onError },
  );

  const changePassword = useMutation(
    (data: ChangePasswordMutationInput) => {
      console.log("ChangePassword mutation data:", data);
      return karrio.graphql.request<change_password>(gqlstr(CHANGE_PASSWORD), {
        data,
      });
    },
    { onSuccess: invalidateCache, onError },
  );

  const confirmPasswordReset = useMutation(
    (data: ConfirmPasswordResetMutationInput) => {
      console.log("ConfirmPasswordReset mutation data:", data);
      return karrio.graphql.request<confirm_password_reset>(
        gqlstr(CONFIRM_PASSWORD_RESET),
        { data },
      );
    },
    { onSuccess: invalidateCache },
  );

  const confirmEmail = useMutation(
    (data: ConfirmEmailMutationInput) => {
      console.log("ConfirmEmail mutation data:", data);
      return karrio.graphql.request<confirm_email>(gqlstr(CONFIRM_EMAIL), { data });
    },
    { onSuccess: invalidateCache },
  );

  const requestPasswordReset = useMutation(
    (data: RequestPasswordResetMutationInput) => {
      console.log("RequestPasswordReset mutation data:", data);
      return karrio.graphql.request<request_password_reset>(
        gqlstr(REQUEST_PASSWORD_RESET),
        { data },
      );
    },
    { onSuccess: invalidateCache },
  );

  return {
    closeAccount,
    confirmEmail,
    changePassword,
    confirmEmailChange,
    confirmPasswordReset,
    requestPasswordReset,
    requestEmailChange,
    registerUser,
    updateUser,
  };
}
