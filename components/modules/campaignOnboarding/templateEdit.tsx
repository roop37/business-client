import { useRouter } from "next/router";
import EmailAutoTemplateEditor from "./unlayerEmailTemplateEditor";

const TemplateEdit = () => {
  const router = useRouter();

  return (
    <div className="flex-col w-full justify-center">
      <EmailAutoTemplateEditor />
    </div>
  );
};

export default TemplateEdit;
