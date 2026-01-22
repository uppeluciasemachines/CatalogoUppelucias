"use client";

import { useEffect, useState } from "react";
import Header from "@/components/header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Search, ShoppingCart } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";

export type Produto = {
  id: number;
  name: string | null;
  price: string | null;
  originalPrice: string | null;
  image: string;
  category: string | null;
  subcategory: string | null;
};

export default function Home() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProdutos() {
      let query = supabase.from("produtos").select("*");

      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      if (category) {
        query = query.eq("subcategory", category);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        console.error("Erro ao buscar produtos:", error);
        return;
      }

      setProdutos(data ?? []);
    }

    fetchProdutos();
  }, [search, category]);

  return (
    <div>
      <Header />

      <div className="flex flex-col items-center mt-6 gap-4">
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full max-w-7xl mx-auto px-3 md:px-0">
          {/* Busca */}
          <div className="w-full sm:flex-1">
            <InputGroup>
              <InputGroupAddon>
                <Search className="w-4 h-4" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Busque por produto"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
          </div>

          {/* Filtro */}
          <div className="w-full md:w-1/3">
            <Select onValueChange={(value) => setCategory(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="stitch">Stitch</SelectItem>
                <SelectItem value="como-treinar-o-seu-dragao">
                  Como Treinar o Seu Dragão
                </SelectItem>
                <SelectItem value="ursinho-pooh">Ursinho Pooh</SelectItem>
                <SelectItem value="bob-esponja">Bob Esponja</SelectItem>
                <SelectItem value="animes">Animes</SelectItem>
                <SelectItem value="garfield">Garfield</SelectItem>
                <SelectItem value="grogo">Grogu</SelectItem>
                <SelectItem value="hello-kitty">Hello Kitty</SelectItem>
                <SelectItem value="looney-tunes">Looney Tunes</SelectItem>
                <SelectItem value="mario">Super Mario</SelectItem>
                <SelectItem value="minions">Minions</SelectItem>
                <SelectItem value="monstros-sa">Monstros S.A.</SelectItem>
                <SelectItem value="marvel">Marvel</SelectItem>
                <SelectItem value="popeye">Popeye</SelectItem>
                <SelectItem value="smurfs">Smurfs</SelectItem>
                <SelectItem value="sonic">Sonic</SelectItem>
                <SelectItem value="tartaruga-ninja">
                  Tartarugas Ninja
                </SelectItem>
                <SelectItem value="toystory">Toy Story</SelectItem>
                <SelectItem value="mickey">Mickey Mouse</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 max-w-7xl mx-auto px-3 sm:px-0">
          {produtos.map((produto) => {
            const imagensValidas: string[] = (() => {
              if (!produto.image) return [];

              try {
                const parsed: unknown = JSON.parse(produto.image);

                if (Array.isArray(parsed)) {
                  return parsed.filter(
                    (img): img is string =>
                      typeof img === "string" &&
                      (img.startsWith("http") || img.startsWith("/")),
                  );
                }
              } catch (error) {
                console.error("Erro ao parsear imagens:", produto.image, error);
              }

              return [];
            })();

            return (
              <Card key={produto.id} className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="text-base line-clamp-2">
                    {produto.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-2">
                  {imagensValidas.length > 0 && (
                    <Carousel className="w-full">
                      <CarouselContent>
                        {imagensValidas.map((img, index) => (
                          <CarouselItem key={index}>
                            <Image
                              src={img}
                              alt={produto.name ?? "Produto"}
                              width={400}
                              height={300}
                              className="w-full h-28 sm:h-36 md:h-40 object-cover rounded-md"
                              loading="lazy"
                            />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-base sm:text-lg">
                      R$ {produto.price}
                    </span>

                    {produto.originalPrice && (
                      <span className="text-xs sm:text-sm line-through text-muted-foreground">
                        R$ {produto.originalPrice}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {produto.category}
                    {produto.subcategory && ` • ${produto.subcategory}`}
                  </p>
                </CardContent>

                <CardFooter>
                  <Button
                    onClick={() => addToCart(produto)}
                    className="w-full flex gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Adicionar
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
