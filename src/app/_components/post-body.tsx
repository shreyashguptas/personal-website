import markdownStyles from "./markdown-styles.module.css";

type Props = {
  content: string;
};

export function PostBody({ content }: Props) {
  return (
    <div className="container-prose">
      <div
        className={`${markdownStyles["markdown"]} prose-editorial`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
