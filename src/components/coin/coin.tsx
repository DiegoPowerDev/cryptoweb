"use client";

import React, { useEffect } from "react";
import CoinValues from "../coinvalues";

import Searcher from "../seacher/searcher";
import { useCoinStore } from "@/store/coinstore";

export default function Coin() {
  const loadCoinData = useCoinStore((s) => s.loadCoinData);
  const coins = useCoinStore((s) => s.coins);
  const loading = useCoinStore((s) => s.loading);

  useEffect(() => {
    loadCoinData();
  }, []);

  return (
    <>
      {loading ? (
        <div className="h-full overflow-hidden bg-black flex justify-center flex-col items-center gap-4">
          <div className=" text-3xl text-yellow-300 font-bold">Loading</div>
          <div className="w-40 h-40 border-8 border-yellow-500/10 border-t-yellow-500 animate-spin rounded-full" />
        </div>
      ) : (
        <div className="h-full w-full">
          <div className="w-full flex justify-center">
            <Searcher datos={coins} />
          </div>
          <div className="bg-black grid lg:grid-cols-4 gap-10 p-10 md:grid-cols-3 sm:grid-cols-2 overflow-hidden h-full">
            {coins?.map((e, i) => (
              <div
                key={i}
                className="transform duration-200 h-full rounded-lg border-2 border-gray-300 p-2  hover:border-yellow-200  hover:scale-105  grid grid-cols-1 grid-rows-[2fr_1fr] place-content-center gap-4 overflow-hidden  "
              >
                <CoinValues
                  name={e.name}
                  icon={e.symbol}
                  price={e.price}
                  hour={e.change1h}
                  day={e.change24h}
                  week={e.change7d}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
