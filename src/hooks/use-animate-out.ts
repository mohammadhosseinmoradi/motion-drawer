import { useEffect } from "react";

type UseAnimateOutProps = {
  enable: boolean;
  onClose: () => void;
};

export function useAnimateOut(props: UseAnimateOutProps) {
  const { enable, onClose } = props;

  useEffect(() => {
    if (enable) onClose();
  }, [enable]);
}
