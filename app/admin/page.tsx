"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Edit, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export type Produto = {
  id: number;
  name: string | null;
  price: string | null;
  originalPrice: string | null;
  image: (File | string)[];
  category: string | null;
  subcategory: string | null;
};

export default function Home() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  const [novasImagens, setNovasImagens] = useState<File[]>([]);

  useEffect(() => {
    async function fetchProdutos() {
      let query = supabase.from("produtos").select("*");

      if (search) query = query.ilike("name", `%${search}%`);
      if (category) query = query.eq("subcategory", category);

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (!error) setProdutos(data ?? []);
    }

    fetchProdutos();
  }, [search, category]);

  function handleEdit(produto: Produto) {
    setProdutoEditando(produto);
    setNovasImagens([]);
    setOpen(true);
  }

  async function handleSave() {
    if (!produtoEditando) return;
    setIsLoading(true);
    const imageUrls: string[] = [];

    for (const file of novasImagens) {
      const fileName = `${Date.now()}-${crypto.randomUUID()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("imagem_produtos")
        .upload(fileName, file);

      if (uploadError) {
        toast.error("Erro ao enviar imagem");
        console.error(uploadError);
        return;
      }

      const { data } = supabase.storage
        .from("imagem_produtos")
        .getPublicUrl(fileName);

      if (data?.publicUrl) {
        imageUrls.push(data.publicUrl);
      }
    }

    const { error } = await supabase
      .from("produtos")
      .update({
        name: produtoEditando.name,
        price: produtoEditando.price,
        originalPrice: produtoEditando.originalPrice,
        category: produtoEditando.category,
        subcategory: produtoEditando.subcategory,
        image: imageUrls.length > 0 ? imageUrls : produtoEditando.image,
      })
      .eq("id", produtoEditando.id);

    if (error) {
      toast.error("Erro ao atualizar produto");
      console.error(error);
      return;
    }

    toast.success("Produto atualizado com sucesso");
    setOpen(false);
    setIsLoading(false);
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="flex gap-4 max-w-7xl mx-auto ">
        <InputGroup>
          <InputGroupAddon>
            <Search className="w-4 h-4" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Buscar produto"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>

        <Select onValueChange={setCategory}>
          <SelectTrigger className="w-[30vw]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="stitch">Stitch</SelectItem>
            <SelectItem value="mario">Super Mario</SelectItem>
            <SelectItem value="marvel">Marvel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table className="max-w-7xl mx-auto border rounded-xl">
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Subcategoria</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Imagem</TableHead>
            <TableHead className="text-end">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {produtos.map((produto) => (
            <TableRow key={produto.id}>
              <TableCell>{produto.name}</TableCell>
              <TableCell>{produto.category}</TableCell>
              <TableCell>{produto.subcategory}</TableCell>
              <TableCell>R$ {produto.price}</TableCell>
              <TableCell>
                {produto.image ? (
                  <Badge className="bg-green-600 text-white">
                    Imagens enviadas
                  </Badge>
                ) : (
                  <Badge variant="destructive">Pendente</Badge>
                )}
              </TableCell>
              <TableCell className="text-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(produto)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>

          {produtoEditando && (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Nome</Label>
                <Input
                  value={produtoEditando.name ?? ""}
                  onChange={(e) =>
                    setProdutoEditando({
                      ...produtoEditando,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Preço</Label>
                <Input
                  value={produtoEditando.price ?? ""}
                  onChange={(e) =>
                    setProdutoEditando({
                      ...produtoEditando,
                      price: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                {" "}
                <Label>Preço Original</Label>{" "}
                <Input
                  value={produtoEditando.originalPrice ?? ""}
                  onChange={(e) =>
                    setProdutoEditando({
                      ...produtoEditando,
                      originalPrice: e.target.value,
                    })
                  }
                />{" "}
              </div>{" "}
              <div className="grid gap-2">
                {" "}
                <Label>Categoria</Label>{" "}
                <Input
                  value={produtoEditando.category ?? ""}
                  onChange={(e) =>
                    setProdutoEditando({
                      ...produtoEditando,
                      category: e.target.value,
                    })
                  }
                />{" "}
              </div>{" "}
              <div className="grid gap-2">
                {" "}
                <Label>Subcategoria</Label>{" "}
                <Select
                  value={produtoEditando.subcategory ?? ""}
                  onValueChange={(value) =>
                    setProdutoEditando({
                      ...produtoEditando,
                      subcategory: value,
                    })
                  }
                >
                  {" "}
                  <SelectTrigger className="w-full">
                    {" "}
                    <SelectValue placeholder="Filtrar por categoria" />{" "}
                  </SelectTrigger>{" "}
                  <SelectContent>
                    {" "}
                    <SelectItem value="stitch">Stitch</SelectItem>{" "}
                    <SelectItem value="como-treinar-o-seu-dragao">
                      {" "}
                      Como Treinar o Seu Dragão{" "}
                    </SelectItem>{" "}
                    <SelectItem value="ursinho-pooh">
                      Ursinho Pooh
                    </SelectItem>{" "}
                    <SelectItem value="bob-esponja">Bob Esponja</SelectItem>{" "}
                    <SelectItem value="animes">Animes</SelectItem>{" "}
                    <SelectItem value="garfield">Garfield</SelectItem>{" "}
                    <SelectItem value="grogo">Grogu</SelectItem>{" "}
                    <SelectItem value="hello-kitty">Hello Kitty</SelectItem>{" "}
                    <SelectItem value="looney-tunes">Looney Tunes</SelectItem>{" "}
                    <SelectItem value="mario">Super Mario</SelectItem>{" "}
                    <SelectItem value="minions">Minions</SelectItem>{" "}
                    <SelectItem value="monstros-sa">Monstros S.A.</SelectItem>{" "}
                    <SelectItem value="marvel">Marvel</SelectItem>{" "}
                    <SelectItem value="popeye">Popeye</SelectItem>{" "}
                    <SelectItem value="smurfs">Smurfs</SelectItem>{" "}
                    <SelectItem value="sonic">Sonic</SelectItem>{" "}
                    <SelectItem value="tartaruga-ninja">
                      {" "}
                      Tartarugas Ninja{" "}
                    </SelectItem>{" "}
                    <SelectItem value="toystory">Toy Story</SelectItem>{" "}
                    <SelectItem value="mickey">Mickey Mouse</SelectItem>{" "}
                  </SelectContent>{" "}
                </Select>{" "}
              </div>
              <div className="grid gap-2">
                <Label>Imagens</Label>
                <Input
                  type="file"
                  multiple
                  onChange={(e) =>
                    setNovasImagens(Array.from(e.target.files ?? []))
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
