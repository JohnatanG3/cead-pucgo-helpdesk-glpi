import AdminTicketDebugPage from "../../[id]/debug-page";

export default function DebugPage({ params }: { params: { id: string } }) {
	return <AdminTicketDebugPage params={params} />;
}
