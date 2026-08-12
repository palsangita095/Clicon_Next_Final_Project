"use client";

interface Props {
  content: string;
}

const UserMessage = ({ content }: Props) => {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-3xl rounded-br-md bg-primary px-4 py-3 text-primary-foreground shadow-lg">
        <p className="leading-7">{content}</p>
      </div>
    </div>
  );
};

export default UserMessage;
