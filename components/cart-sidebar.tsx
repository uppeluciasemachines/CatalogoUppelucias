"use client";

import { useCart } from "@/context/cart-context";
import { Plus, Minus, Trash2, MessageCircle, ShoppingBag } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Button } from "./ui/button";

const WHATSAPP_NUMBER = "5511999999999";

export default function CartSidebar() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    generateWhatsAppMessage,
    isCartOpen,
    setIsCartOpen,
    clearCart,
  } = useCart();

  const formatPrice = (value: string | null) => {
    const price = Number(value?.replace(",", ".") ?? 0);
    return `R$ ${price.toFixed(2).replace(".", ",")}`;
  };

  const handleSendWhatsApp = () => {
    const message = generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`,
      "_blank",
    );
  };

  return (
    <>
      <Button className="mr-3 md:mr-0" onClick={() => setIsCartOpen(true)}>
        <ShoppingBag />
        Carrinho ({cart.length})
      </Button>

      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent className="flex flex-col w-full">
          <SheetHeader>
            <SheetTitle>Seu Carrinho</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground">
                Seu carrinho está vazio
              </p>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm">{formatPrice(item.price)}</p>

                      <div className="flex justify-between items-center w-full gap-2 mt-2">
                        <div className=" flex flex-row gap-3 items-center justify-center">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                          >
                            <Minus />
                          </Button>

                          <span className="font-semibold">{item.quantity}</span>

                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            <Plus />
                          </Button>
                        </div>

                        <Button
                          variant="destructive"
                          className="cursor-pointer"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 />
                          Remover
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <SheetFooter className="border-t p-4 space-y-3">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>R$ {getTotalPrice().toFixed(2).replace(".", ",")}</span>
              </div>
              <div className="flex flex-row gap-4 ">
                <Button variant="ghost" onClick={clearCart}>
                  Limpar carrinho
                </Button>
                <Button
                  className="cursor-pointer bg-green-600 hover:bg-green-700"
                  onClick={handleSendWhatsApp}
                >
                  <MessageCircle />
                  Enviar pelo WhatsApp
                </Button>
              </div>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
