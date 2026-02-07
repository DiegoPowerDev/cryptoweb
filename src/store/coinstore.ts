import { create } from "zustand";
import {
  doc,
  getFirestore,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { app } from "../lib/firebase";
import { load } from "cheerio";
import { FirebaseError } from "firebase/app";
const db = getFirestore(app);

interface Coin {
  name: string;
  symbol: string;
  change1h: string;
  change24h: string;
  change7d: string;
  price: string;
}

interface CoinStore {
  coins: Coin[];
  loading: boolean;
  setCoins: (coins: Coin[]) => void;
  loadCoinData: () => void;
  saveToFirestore: () => Promise<void>;
}

export const useCoinStore = create<CoinStore>((set) => ({
  coins: [],
  setCoins: (coins: Coin[]) => {
    console.log(coins);
    set({ coins });
    useCoinStore.getState().saveToFirestore();
  },
  loading: true,
  loadCoinData: async () => {
    const userDoc = doc(db, "coins", "coins");
    const unsubscribe = onSnapshot(
      userDoc,
      (snapshot) => {
        if (snapshot.exists()) {
          const firestoreData = snapshot.data();
          set({
            ...firestoreData,
            loading: false,
          });
          console.log("✅ Datos cargados desde Firestore");
        } else {
          console.warn("⚠️ Store no encontrado.");
          set({
            loading: false,
          });
        }
      },
      (error) => {
        console.error("❌ Error en onSnapshot:", error);
        set({
          loading: false,
        });
      },
    );

    const res = await fetch("/api/scrapper");
    const data = await res.json();
    console.log("Se cargaron datos de la web");
    set({ coins: data.data });

    return unsubscribe;
  },
  saveToFirestore: async () => {
    const state = useCoinStore.getState();

    if (state.loading) {
      console.log("⏸️ Guardado pausado: cargando desde Firestore");
      return;
    }

    const data = Object.fromEntries(
      Object.entries(state).filter(
        ([key, value]) => typeof value !== "function" && key !== "loading",
      ),
    );

    try {
      await setDoc(doc(db, "coins", "coins"), data, { merge: true });
      console.log("💾 Datos sincronizados en Firestore");
    } catch (err) {
      const error = err as FirebaseError; // Type assertion rápida
      console.error("❌ Error de Firebase:", error.code);
    }
  },
}));
