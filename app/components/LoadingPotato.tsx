import { PotatoLoading } from "./PotatoMascot";

type Props = {
  message?: string;
};

export default function LoadingPotato({ message = "Loading..." }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <PotatoLoading size={100} />
      <p className="text-stone text-lg animate-pulse">{message}</p>
    </div>
  );
}
