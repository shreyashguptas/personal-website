import Image from "next/image";

type Props = {
  name: string;
  picture: string;
};

const Avatar = ({ name, picture }: Props) => {
  return (
    <div className="flex items-center">
      <div className="rounded-full mr-4 overflow-hidden">
        <Image
          src={picture}
          alt={name}
          width={48}
          height={48}
          className="object-cover w-12 h-12"
        />
      </div>
      <div className="text-xl font-bold">{name}</div>
    </div>
  );
};

export default Avatar;
