import { notFound } from "next/navigation";
import { getClient, updateClient } from "@/actions/clients";
import PageTitleSetter from "@/components/page-title-setter";
import ClientForm from "@/components/clients/client-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getClientDetalii, upsertClientDetalii } from "@/actions/client-detalii";
import ClientDetaliiForm from "@/components/clients/client-detalii-form";
import { getClientPuncteDeLucru, upsertClientPunctDeLucru, deleteClientPunctDeLucru } from "@/actions/client-punct";
import ClientPunctPanels from "@/components/clients/client-punct-panels";
import { getClientIstoric, upsertClientIstoric } from "@/actions/client-istoric";
import ClientIstoricForm from "@/components/clients/client-istoric-form";

export const dynamic = "force-dynamic";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (Number.isNaN(id)) return notFound();

  const client = await getClient(id);
  if (!client) return notFound();
  const [detalii, puncte, istoric] = await Promise.all([
    getClientDetalii(id),
    getClientPuncteDeLucru(id),
    getClientIstoric(id),
  ]);

  async function onSubmit(fd: FormData) {
    "use server";
    return await updateClient(id, fd);
  }

  return (
    <div className="p-6 space-y-4">
      <PageTitleSetter title={`Clients / ${client.name} / Edit`} />
      <h1 className="text-2xl font-semibold">Editeaza: {client.name}</h1>
      <Tabs defaultValue="form" className="w-full">
        <TabsList>
          <TabsTrigger value="form">Client</TabsTrigger>
          <TabsTrigger value="other">Detalii</TabsTrigger>
          <TabsTrigger value="punct">Punct de lucru</TabsTrigger>
          <TabsTrigger value="istoric">Istoric</TabsTrigger>
        </TabsList>
        <TabsContent value="form" className="pt-4" forceMount>
          <ClientForm initial={client} onSubmit={onSubmit} submitLabel="Salveaza" />
        </TabsContent>
        <TabsContent value="other" className="pt-4" forceMount>
          {/* Detalii form */}
          <ClientDetaliiForm
            initial={detalii ?? undefined}
            onSubmit={upsertClientDetalii.bind(null, id)}
            submitLabel="Salveaza detalii"
          />
        </TabsContent>
        <TabsContent value="punct" className="pt-4" forceMount>
          <ClientPunctPanels
            rows={puncte}
            onSave={async (fd: FormData) => {
              "use server";
              return await upsertClientPunctDeLucru(id, fd);
            }}
            onCreate={async (fd: FormData) => {
              "use server";
              return await upsertClientPunctDeLucru(id, fd);
            }}
            onDelete={async (rowId: number) => {
              "use server";
              await deleteClientPunctDeLucru(id, rowId);
            }}
          />
        </TabsContent>
        <TabsContent value="istoric" className="pt-4" forceMount>
          <ClientIstoricForm
            initial={istoric ?? undefined}
            onSubmit={upsertClientIstoric.bind(null, id)}
            submitLabel="Salveaza istoric"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
