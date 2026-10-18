type Props = {
  title: string;
};

function Title({ title }: Props) {
  return <h2 className="px-2 pb-1 text-[0.8125rem] font-medium text-ink-muted">{title}</h2>;
}

export default Title;
