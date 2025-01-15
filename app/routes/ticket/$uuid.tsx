import { useLoaderData, json } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../root";

export const loader= async ({ params }: LoaderFunctionArgs) => {
  const { uuid } = params;

  if (!uuid) {
    return json({ status: "error", message: "UUID is required" }, { status: 400 }); // Bad Request
  }

  const ticketRef = doc(db, "tickets", uuid);
  const ticketSnap = await getDoc(ticketRef);

  if (!ticketSnap.exists()) {
    return json({ status: "error", message: "Ticket not found" },{status: 404}); // Not Found
  }

  const ticketData = ticketSnap.data();

  if (ticketData.status === "済") {
    return json({ status: "error", message: "Ticket already used" },{status: 409 }); // Conflict
  }

  await updateDoc(ticketRef, { status: "済" });

  return json({ status: "success", message: "Ticket updated" }, {status: 200}); // OK
};

export default function Ticket() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      {data.status === "success" ? (
        <h1>更新完了</h1>
      ) : (
        <h1>エラー: {data.message}</h1>
      )}
    </div>
  );
}