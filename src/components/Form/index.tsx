import { cm } from "@/utils/helpers/styleMerger";

interface Props extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "className"> {
  classes?: string;
  children: React.ReactElement | React.ReactElement[];
}

function Form({ children, classes, ...props }: Props) {
  return (
    <form className={cm(classes)} {...props}>
      {children}
    </form>
  );
}

export default Form;
