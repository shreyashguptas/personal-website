import Image from "next/image";

type Props = {
  name: string;
  picture: string;
};

const Avatar = ({ name, picture }: Props) => {
  return (
    <div className="flex items-center gap-3">
      <div className="overflow-hidden rounded-full">
        <Image
          src={picture}
          alt={name}
          width={32}
          height={32}
          className="object-cover w-8 h-8"
        />
      </div>
      <div className="text-sm font-medium text-foreground">{name}</div>
    </div>
  );
};

export default Avatar;
