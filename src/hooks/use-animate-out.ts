import { useEffect } from "react";

type UseAnimateOutProps = {
  isClose: boolean;
  onClose: () => void;
};

export function useAnimateOut(props: UseAnimateOutProps) {
  const { isClose, onClose } = props;

  useEffect(() => {
    if (isClose) onClose();
  }, [isClose]);
}
