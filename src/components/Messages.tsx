import { useSnackbar } from "notistack";
import type { SnackbarMessage, VariantType, BaseVariant } from "notistack";
import { useEffect } from "react";

interface MessageProps {
  message: string;
  variant?: BaseVariant;
}

export const Message = (props: MessageProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const handleMessage = (message: SnackbarMessage, variant: VariantType) => {
    enqueueSnackbar(message, { variant });
  };
  // biome-ignore lint/correctness/useExhaustiveDependencies: need this
  useEffect(() => {
    handleMessage(props.message, props.variant || "default");
  }, []);
  return <></>;
};

export const ErrorMessage = (props: MessageProps) => {
  return <Message message={props.message} variant="error" />;
};

export const SuccessMessage = (props: MessageProps) => {
  return <Message message={props.message} variant="success" />;
};
