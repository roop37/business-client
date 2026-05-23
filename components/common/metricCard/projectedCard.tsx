import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ProjectedCard = ({
  name,
  desc,
  value,
}: {
  name: string;
  desc: string;
  value: string;
}) => {
  return (
    <Card className="rounded-lg hover:shadow-md transition-shadow duration-200 max-h-[140px] overflow-hidden bg-[#F3F7FB] flex justify-between items-center space-x-2">
      <CardHeader>
        <CardTitle className="text-base md:text-lg text-gray-600">
          {name}
        </CardTitle>
        <CardDescription className="text-xs text-gray-500">
          {desc}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-xl md:text-3xl font-semibold text-primary pb-0">
        ${value}
      </CardContent>
    </Card>
  );
};

export default ProjectedCard;
