"use client";

import { useState, FormEvent } from "react"; // 1. Importamos FormEvent
import CoinValues from "../coinvalues";
import { useCoinStore } from "@/store/coinstore";

// Es mejor importar la interfaz desde tu store si ya existe allí
interface Coin {
  name: string;
  symbol: string;
  change1h: string;
  change24h: string;
  change7d: string;
  price: string;
}

export default function Searcher() {
  const coins = useCoinStore((s) => s.coins);

  // 2. Inicializamos con null explícitamente
  const [searched, setSearched] = useState<Coin | null>(null);
  const [lastSearch, setLastSearch] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // 3. Tipamos el evento como FormEvent
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    const coinFound = coins.find((item) =>
      item.name.toLowerCase().includes(inputValue.toLowerCase()),
    );

    if (coinFound) {
      setSearched(coinFound);
      setLastSearch(true);
    } else {
      console.log("Elemento no encontrado");
      setSearched(null);
      setLastSearch(false);
    }
  };

  return (
    <div className="w-full h-full min-h-96 grid rounded-lg border-4 md:grid-cols-2 m-10 grid-rows-1">
      <div className="text-white content-center">
        <form onSubmit={onSubmit}>
          <div className="grid md:grid-cols-1 md:p-10 p-6">
            <input
              className="border-2 h-10 rounded-lg border-yellow-300 text-center text-white"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button
              className="border-2 transition-all duration-300 border-black h-10 p-1 rounded-lg font-bold bg-yellow-300 mt-7 active:bg-white active:scale-105 hover:bg-red-400 hover:scale-105"
              type="submit"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* 4. Verificamos que searched no sea null antes de renderizar */}
      {!lastSearch || !searched ? (
        <></>
      ) : (
        <div className="p-4 md:border-l-2 md:border-t-0 border-t-2 border-white h-full grid grid-cols-1 grid-rows-[2fr_1fr] place-content-center gap-4">
          <CoinValues
            name={searched.name}
            icon={searched.symbol}
            price={searched.price}
            hour={searched.change1h}
            day={searched.change24h}
            week={searched.change7d}
          />
        </div>
      )}
    </div>
  );
}
