import Coin from "@/components/coin/coin";

export default function Home() {
  return (
    <main className="bg-black text-white flex-1 flex w-full flex-col">
      <div className="text-yellow-200 flex-1 align-middle text-center text-4xl p-5">
        The value of the coins today:
      </div>
      <Coin />
    </main>
  );
}
