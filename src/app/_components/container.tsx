import cn from "classnames";

type Props = {
  children?: React.ReactNode;
  className?: string;
};

const Container = ({ children, className }: Props) => {
  return <div className={cn("container-editorial", className)}>{children}</div>;
};

export default Container;
