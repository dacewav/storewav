/**
 * Contract clause text extracted verbatim from contracts/*.md files.
 * This file contains the EXACT legal text for each license type.
 * The generator imports this data to render PDFs with accurate content.
 */

export type ContractClause = {
	title: string; // e.g. "CLÁUSULA I. OBJETO DE LA LICENCIA"
	paragraphs: string[]; // Each paragraph as a separate string
};

export type ContractTemplate = {
	title: string;
	subtitle: string;
	clauses: ContractClause[];
};

// ─── Shared clause text for non-exclusive licenses (MP3, WAV, Premium) ───

function buildNonExclusiveClauses(cfg: {
	copies: string;
	streams: string;
	priceText: string;
	stemsClause: string;
	stemsRestriction: string;
}): ContractClause[] {
	return [
		{
			title: 'CLÁUSULA I. OBJETO DE LA LICENCIA',
			paragraphs: [
				'El PRODUCTOR otorga al ARTISTA una licencia no exclusiva, intransferible y no sublicenciable para usar el beat descrito anteriormente con el fin de crear una nueva obra musical (en adelante, la "Nueva Canción"), entendida como una única composición musical vocal o instrumental que incorpore el beat licenciado. Para efectos de este contrato, "Nueva Canción" se refiere exclusivamente a una sola obra; cada obra adicional que utilice el beat requerirá una licencia por separado o una licencia de nivel superior. Se considera la misma Nueva Canción: versiones, remixes, ediciones acústicas, instrumentales y ediciones de radio de la obra original, siempre que mantengan la misma composición vocal/letra base. Bajo las siguientes limitaciones:',
				'1.1 Formato: El archivo indicado en la sección Descripción del Beat.',
				`1.2 Unidades físicas: ${cfg.copies}`,
				`1.3 Streaming: ${cfg.streams}`,
				'1.4 Renovación: Al alcanzar cualquiera de estos límites, el ARTISTA deberá adquirir una licencia superior para continuar la distribución legal de la Nueva Canción. De continuar explotando la Nueva Canción sin haber renovado la licencia, el ARTISTA incurrirá en infracción de este contrato y será responsable de los daños y perjuicios causados al PRODUCTOR.',
				'1.5 Esta licencia NO transfiere la titularidad ni los derechos de autor del beat. El PRODUCTOR conserva en todo momento la propiedad intelectual de la producción original.',
			],
		},
		{
			title: 'CLÁUSULA II. TIPO DE LICENCIA Y ALCANCE',
			paragraphs: [
				'Tipo: NO EXCLUSIVA. El PRODUCTOR puede licenciar el mismo beat a otros artistas.',
				'2.1 Plataformas autorizadas: Spotify, Apple Music, YouTube, TikTok, SoundCloud y plataformas de streaming digital. Todas las reproducciones en plataformas digitales, incluyendo redes sociales (TikTok, Instagram Reels, YouTube Shorts, etc.), cuentan para el límite de streams establecido en la Cláusula 1.3.',
				'2.2 Uso en presentaciones en vivo: Incluido.',
				'2.3 Sincronización (TV, cine, publicidad, radio): NO está permitida con esta licencia. Se requiere adquirir una licencia ilimitada o exclusiva.',
				'2.4 Territorio: Mundial.',
				'2.5 Vigencia: Indefinida mientras no se superen los límites del punto 1.3, momento en el que la licencia expira automáticamente y el ARTISTA deberá cesar la distribución de inmediato o adquirir una licencia superior.',
				'2.6 NFTs / Web3: El uso del beat para acuñar NFTs, tokens digitales o cualquier proyecto de blockchain queda prohibido salvo autorización escrita del PRODUCTOR.',
			],
		},
		{
			title: 'CLÁUSULA III. DERECHOS Y PORCENTAJES',
			paragraphs: [
				'3.1 Propiedad del beat: El PRODUCTOR retiene el 100% de la propiedad y los derechos de autor (copyright) del beat original.',
				'3.2 Ingresos del máster: El ARTISTA conserva el 100% de los ingresos por venta, distribución y streaming de la Nueva Canción, dentro de los límites de la Cláusula I.',
				'3.3 Derechos editoriales (Publishing Rights): El ARTISTA conserva el 100% de los derechos editoriales sobre la letra de la Nueva Canción. El PRODUCTOR retiene sus derechos como compositor del beat, inherentes a su titularidad como autor de la producción original.',
			],
		},
		{
			title: 'CLÁUSULA IV. CRÉDITOS OBLIGATORIOS',
			paragraphs: [
				'El ARTISTA se compromete a acreditar al PRODUCTOR en todos los lanzamientos y plataformas de la siguiente forma:',
				'"Prod. by Dace" o "Beat by Dace"',
				'El crédito deberá aparecer como mínimo en: (a) los metadatos de distribución digital (título del track, campo de créditos o notas del lanzamiento), y (b) la descripción o título de cualquier contenido de video (YouTube, TikTok, Instagram Reels, etc.) donde se utilice la Nueva Canción.',
				'La omisión del crédito constituye una violación a este contrato y puede resultar en la revocación inmediata de la licencia sin derecho a reembolso.',
			],
		},
		{
			title: 'CLÁUSULA V. RESTRICCIONES Y PROHIBICIONES',
			paragraphs: [
				'5.1 Queda expresamente prohibido al ARTISTA:',
				'a) Registrar el beat o la producción musical original como obra propia ante cualquier organismo de derechos de autor (INDAUTOR, BMI, ASCAP, etc.). El ARTISTA podrá registrar la Nueva Canción como obra derivada, reflejando correctamente la autoría del PRODUCTOR sobre la composición musical.',
				'b) Registrar la Nueva Canción en sistemas de Content ID (YouTube, Facebook, Instagram, etc.) sin autorización previa y por escrito del PRODUCTOR.',
				'c) Sublicenciar, revender, ceder o transferir esta licencia a terceros, incluyendo traspasos por herencia, cesión de proyecto o firma con sello discográfico, salvo acuerdo escrito.',
				cfg.stemsRestriction,
				'e) Usar el beat en contenido que promueva odio, discriminación, violencia, pornografía o actividades ilegales.',
				'f) Usar el beat en proyectos de NFTs, tokens o blockchain sin autorización expresa.',
				'5.2 El incumplimiento de cualquiera de estas restricciones constituye incumplimiento grave y puede resultar en la revocación inmediata de la licencia sin reembolso (ver definición en Cláusula XI.7).',
			],
		},
		{
			title: 'CLÁUSULA VI. DERECHOS QUE CONSERVA EL PRODUCTOR',
			paragraphs: [
				'a) Licenciar el mismo beat a otros artistas en cualquier momento (licencia no exclusiva).',
				'b) Usar el beat en su portafolio, redes sociales y material promocional.',
				'c) Acreditar el beat en su discografía o catálogo de producciones.',
				'd) Revocar la licencia ante incumplimiento grave de los términos aquí establecidos.',
			],
		},
		{
			title: 'CLÁUSULA VII. GARANTÍAS E INDEMNIDAD',
			paragraphs: [
				'7.1 El PRODUCTOR garantiza que es el único autor y titular de los derechos del beat, que todos los elementos que lo componen son de su autoría o cuenta con las licencias necesarias para su uso comercial, y que la producción no infringe derechos de terceros.',
				'7.2 El ARTISTA indemnizará y mantendrá indemne al PRODUCTOR de cualquier reclamación, demanda o daño que surja del contenido lírico o vocal añadido por el ARTISTA, o del uso indebido del beat fuera de los términos de esta licencia.',
			],
		},
		{
			title: 'CLÁUSULA VIII. ENTREGA DE ARCHIVOS',
			paragraphs: [
				'8.1 Entrega del archivo: La entrega se realizará de forma automatizada al confirmarse el pago, o en un plazo máximo de 24 horas en casos de entrega manual.',
				'8.2 Canal de entrega: La entrega se realizará por Email o Google Drive.',
				'8.3 Content ID — Obligación del PRODUCTOR: El PRODUCTOR se compromete a liberar (whitelist) la grabación maestra de la Nueva Canción del ARTISTA en todos los sistemas de Content ID en que el beat esté registrado a su nombre, dentro de las 24 horas hábiles siguientes a recibir el enlace de distribución por parte del ARTISTA. Esta obligación se activa únicamente al recibir dicho enlace; el PRODUCTOR no será responsable de reclamaciones de Content ID si el ARTISTA no ha proporcionado el enlace de distribución. El incumplimiento del plazo da derecho al ARTISTA a solicitar la resolución del contrato y la devolución proporcional del precio pagado.',
			],
		},
		{
			title: 'CLÁUSULA IX. PAGO Y CONDICIONES ECONÓMICAS',
			paragraphs: [
				`El ARTISTA realizó el pago único e irrepetible de: ${cfg.priceText}`,
				'Este pago no genera regalías ni pagos adicionales futuros al PRODUCTOR, salvo acuerdo escrito. El pago de la licencia no es reembolsable, salvo en los supuestos expresamente previstos en la Cláusula VIII.3 del presente contrato.',
				'En caso de chargeback, devolución o reversión del pago por cualquier motivo, la licencia se revocará automáticamente e inmediatamente, sin necesidad de notificación previa. El ARTISTA deberá cesar todo uso del beat y retirar la Nueva Canción de todas las plataformas dentro de los 5 (cinco) días hábiles siguientes a la revocación.',
				'El ARTISTA es responsable de todos los impuestos y tasas aplicables derivados de la compra de esta licencia.',
			],
		},
		{
			title: 'CLÁUSULA X. VIGENCIA Y TERMINACIÓN',
			paragraphs: [
				'La licencia entra en vigor en la fecha de firma (o de pago, en virtud de la Cláusula XIII) y es indefinida mientras no se superen los límites del punto 1.3. Al alcanzarse dichos límites, la licencia expira automáticamente, el ARTISTA deberá cesar de inmediato la distribución de la Nueva Canción en todas las plataformas, y adquirir una licencia superior para continuar su explotación. De no hacerlo, incurrirá en infracción de los derechos de autor del PRODUCTOR y será responsable de los daños y perjuicios causados.',
				'El PRODUCTOR puede revocar esta licencia en caso de incumplimiento grave. La revocación implica la terminación inmediata de todos los derechos otorgados y la obligación del ARTISTA de retirar la Nueva Canción de todas las plataformas de distribución dentro de los 5 (cinco) días hábiles siguientes a la notificación de revocación, o en el plazo técnico mínimo que permita el distribuidor (DistroKid, TuneCore, etc.), lo que ocurra primero. El ARTISTA deberá acreditar documentalmente haber iniciado el proceso de retiro dentro de dicho plazo.',
			],
		},
		{
			title: 'CLÁUSULA XI. CONDICIONES GENERALES',
			paragraphs: [
				'11.1 Modificaciones: Cualquier modificación deberá constar por escrito y ser aceptada por ambas partes.',
				'11.2 Acuerdo completo: Este documento reemplaza cualquier comunicación o acuerdo previo, oral o escrito.',
				'11.3 Fuerza mayor: Ninguna de las partes será responsable por incumplimiento causado por eventos fuera de su control razonable.',
				'11.4 Confidencialidad: Los términos económicos de este acuerdo (precio pagado, descuentos aplicados y condiciones particulares) son confidenciales y no deben ser divulgados por el ARTISTA a terceros, salvo a sus asesores legales, contables, mánager o sello discográfico. Las condiciones generales de la licencia (tipo, alcance, restricciones) no son confidenciales.',
				'11.5 Notificaciones: Cualquier comunicación oficial deberá realizarse por escrito al correo electrónico provisto por cada parte. Las notificaciones enviadas al correo electrónico registrado se considerarán recibidas dentro de las 24 horas siguientes al envío. Las comunicaciones por WhatsApp u otros canales de mensajería tendrán valor informativo, pero solo las notificaciones por correo electrónico tendrán efectos legales conforme a este contrato.',
				'11.6 Protección de datos: Los datos personales recabados serán tratados conforme a la LFPDPPP de México.',
				`11.7 Definición de incumplimiento grave: Se consideran incumplimientos graves, de manera enunciativa más no limitativa: (a) la omisión del crédito obligatorio; (b) el registro no autorizado del beat o la Nueva Canción en sistemas de Content ID; (c) la venta, cesión o sublicenciamiento no autorizados; (d) el uso del beat fuera de los límites de streams o copias pactados sin renovar la licencia; (e) el uso en contenido prohibido por la Cláusula V; (f) el uso en proyectos de NFT/blockchain sin autorización expresa.${cfg.stemsClause}`,
			],
		},
		{
			title: 'CLÁUSULA XII. LEGISLACIÓN APLICABLE',
			paragraphs: [
				'Este contrato se rige por las leyes de los Estados Unidos Mexicanos, en especial la Ley Federal del Derecho de Autor (LFDA) y el Código Civil Federal. Antes de acudir a instancias judiciales, las partes acuerdan intentar resolver cualquier controversia de buena fe mediante negociación directa en un plazo de 15 (quince) días hábiles a partir de la notificación del conflicto. De no llegarse a un acuerdo, las partes se someten a la jurisdicción de los tribunales competentes de la ciudad de Puebla de Zaragoza, Estado de Puebla, México, renunciando expresamente a cualquier otro fuero que pudiera corresponderles por razón de domicilio presente o futuro. En caso de versión en inglés, la versión en español prevalece y es la legalmente vinculante.',
			],
		},
		{
			title: 'CLÁUSULA XIII. ACEPTACIÓN Y ACUERDO COMPLETO',
			paragraphs: [
				'Aceptación por pago: El pago del precio de la licencia por parte del ARTISTA constituye la manifestación inequívoca de su voluntad y su aceptación total e incondicional de todos los términos aquí expuestos, sin necesidad de firma física o digital. Para ventas de exclusivas o contratos con sellos discográficos, se recomienda firma electrónica oficial.',
				'Las partes declaran haber leído, entendido y aceptado voluntariamente todos los términos. Manifiestan que no existe dolo, error ni coacción en su celebración.',
			],
		},
	];
}

// ─── Ilimitada-specific clauses ─────────────────────────────────────

function buildIlimitadaClauses(priceText: string): ContractClause[] {
	return [
		{
			title: 'CLÁUSULA I. OBJETO DE LA LICENCIA',
			paragraphs: [
				'El PRODUCTOR otorga al ARTISTA una licencia no exclusiva, intransferible y no sublicenciable para usar el beat descrito anteriormente con el fin de crear una nueva obra musical (en adelante, la "Nueva Canción"), entendida como una única composición musical vocal o instrumental que incorpore el beat licenciado. Para efectos de este contrato, "Nueva Canción" se refiere exclusivamente a una sola obra; cada obra adicional que utilice el beat requerirá una licencia por separado o una licencia de nivel superior. Se considera la misma Nueva Canción: versiones, remixes, ediciones acústicas, instrumentales y ediciones de radio de la obra original, siempre que mantengan la misma composición vocal/letra base. Bajo las siguientes limitaciones:',
				'1.1 Formato: El archivo indicado en la sección Descripción del Beat.',
				'1.2 Unidades físicas: Hasta SIN LÍMITE (sin límite) copias físicas o descargas digitales.',
				'1.3 Streaming: Hasta SIN LÍMITE (sin límite) reproducciones combinadas en todas las plataformas (Spotify, Apple Music, YouTube, redes sociales, etc.).',
				'1.4 Vigencia de la licencia: Esta licencia es indefinida a perpetuidad, condicionada al cumplimiento de todos los términos del presente contrato. No existen límites de streams ni de copias. La licencia no expirará por volumen de reproducciones o distribución.',
				'1.5 Esta licencia NO transfiere la titularidad ni los derechos de autor del beat. El PRODUCTOR conserva en todo momento la propiedad intelectual de la producción original.',
			],
		},
		{
			title: 'CLÁUSULA II. TIPO DE LICENCIA Y ALCANCE',
			paragraphs: [
				'Tipo: NO EXCLUSIVA. El PRODUCTOR puede licenciar el mismo beat a otros artistas.',
				'2.1 Plataformas autorizadas: Spotify, Apple Music, YouTube, TikTok, SoundCloud y plataformas de streaming digital, incluyendo redes sociales (TikTok, Instagram Reels, YouTube Shorts, etc.), sin límite de reproducciones. Esta licencia es ilimitada y no impone tope de streams en ninguna plataforma.',
				'2.2 Uso en presentaciones en vivo: Incluido.',
				'2.3 Sincronización (TV, cine, publicidad, radio): SÍ está permitida con esta licencia. El uso en sincronización queda sujeto en todo momento a las restricciones de contenido establecidas en la Cláusula V, quedando expresamente prohibida la sincronización en producciones que promuevan odio, discriminación, violencia, pornografía o actividades ilegales, así como en proyectos de NFT/blockchain sin autorización escrita del PRODUCTOR.',
				'2.4 Territorio: Mundial.',
				'2.5 Vigencia: Indefinida a perpetuidad, mientras el ARTISTA cumpla con todos los términos de este contrato. No existen límites de streams ni de copias que provoquen la expiración de esta licencia.',
				'2.6 NFTs / Web3: El uso del beat para acuñar NFTs, tokens digitales o cualquier proyecto de blockchain queda prohibido salvo autorización escrita del PRODUCTOR.',
			],
		},
		{
			title: 'CLÁUSULA III. DERECHOS Y PORCENTAJES',
			paragraphs: [
				'3.1 Propiedad del beat: El PRODUCTOR retiene el 100% de la propiedad y los derechos de autor (copyright) del beat original.',
				'3.2 Ingresos del máster: El ARTISTA conserva el 100% de los ingresos por venta, distribución y streaming de la Nueva Canción, de conformidad con los términos de la Cláusula I y sin límite de volumen.',
				'3.3 Derechos editoriales (Publishing Rights): A diferencia de los planes MP3, WAV y Premium (donde el ARTISTA conserva el 100% de los derechos editoriales), esta licencia Ilimitada establece una división editorial del 50% para el PRODUCTOR (compositor de la música) y 50% para el ARTISTA (autor de la letra). Ambas partes son responsables de registrar la obra con sus respectivas Sociedades de Gestión Colectiva (SACM, BMI, ASCAP, etc.) reflejando esta división.',
			],
		},
		{
			title: 'CLÁUSULA IV. CRÉDITOS OBLIGATORIOS',
			paragraphs: [
				'El ARTISTA se compromete a acreditar al PRODUCTOR en todos los lanzamientos y plataformas de la siguiente forma:',
				'"Prod. by Dace" o "Beat by Dace"',
				'El crédito deberá aparecer como mínimo en: (a) los metadatos de distribución digital (título del track, campo de créditos o notas del lanzamiento), y (b) la descripción o título de cualquier contenido de video (YouTube, TikTok, Instagram Reels, etc.) donde se utilice la Nueva Canción.',
				'La omisión del crédito constituye una violación a este contrato y puede resultar en la revocación inmediata de la licencia sin derecho a reembolso.',
			],
		},
		{
			title: 'CLÁUSULA V. RESTRICCIONES Y PROHIBICIONES',
			paragraphs: [
				'5.1 Queda expresamente prohibido al ARTISTA:',
				'a) Registrar el beat o la producción musical original como obra propia ante cualquier organismo de derechos de autor (INDAUTOR, BMI, ASCAP, etc.). El ARTISTA podrá registrar la Nueva Canción como obra derivada, reflejando correctamente la autoría del PRODUCTOR sobre la composición musical.',
				'b) Registrar la Nueva Canción en sistemas de Content ID (YouTube, Facebook, Instagram, etc.) sin autorización previa y por escrito del PRODUCTOR.',
				'c) Sublicenciar, revender, ceder o transferir esta licencia a terceros, incluyendo traspasos por herencia, cesión de proyecto o firma con sello discográfico, salvo acuerdo escrito.',
				'd) Extraer, cortar o alterar elementos del beat (stems, samples, etc.) para comercializarlos como producción propia. Los stems entregados son de uso exclusivo para la mezcla y producción de la Nueva Canción. Queda prohibido utilizarlos como base para otras producciones, remezclas no autorizadas o cualquier canción distinta a la acordada en este contrato.',
				'e) Usar el beat en contenido que promueva odio, discriminación, violencia, pornografía o actividades ilegales.',
				'f) Usar el beat en proyectos de NFTs, tokens o blockchain sin autorización expresa.',
				'5.2 El incumplimiento de cualquiera de estas restricciones constituye incumplimiento grave y puede resultar en la revocación inmediata de la licencia sin reembolso (ver definición en Cláusula XI.7).',
			],
		},
		{
			title: 'CLÁUSULA VI. DERECHOS QUE CONSERVA EL PRODUCTOR',
			paragraphs: [
				'a) Licenciar el mismo beat a otros artistas en cualquier momento (licencia no exclusiva).',
				'b) Usar el beat en su portafolio, redes sociales y material promocional.',
				'c) Acreditar el beat en su discografía o catálogo de producciones.',
				'd) Revocar la licencia ante incumplimiento grave de los términos aquí establecidos.',
			],
		},
		{
			title: 'CLÁUSULA VII. GARANTÍAS E INDEMNIDAD',
			paragraphs: [
				'7.1 El PRODUCTOR garantiza que es el único autor y titular de los derechos del beat, que todos los elementos que lo componen son de su autoría o cuenta con las licencias necesarias para su uso comercial, y que la producción no infringe derechos de terceros.',
				'7.2 El ARTISTA indemnizará y mantendrá indemne al PRODUCTOR de cualquier reclamación, demanda o daño que surja del contenido lírico o vocal añadido por el ARTISTA, o del uso indebido del beat fuera de los términos de esta licencia.',
			],
		},
		{
			title: 'CLÁUSULA VIII. ENTREGA DE ARCHIVOS',
			paragraphs: [
				'8.1 Entrega del archivo: La entrega se realizará de forma automatizada al confirmarse el pago, o en un plazo máximo de 24 horas en casos de entrega manual.',
				'8.2 Canal de entrega: La entrega se realizará por Email o Google Drive.',
				'8.3 Content ID — Obligación del PRODUCTOR: El PRODUCTOR se compromete a liberar (whitelist) la grabación maestra de la Nueva Canción del ARTISTA en todos los sistemas de Content ID en que el beat esté registrado a su nombre, dentro de las 24 horas hábiles siguientes a recibir el enlace de distribución por parte del ARTISTA. Esta obligación se activa únicamente al recibir dicho enlace; el PRODUCTOR no será responsable de reclamaciones de Content ID si el ARTISTA no ha proporcionado el enlace de distribución. El incumplimiento del plazo da derecho al ARTISTA a solicitar la resolución del contrato y la devolución proporcional del precio pagado.',
			],
		},
		{
			title: 'CLÁUSULA IX. PAGO Y CONDICIONES ECONÓMICAS',
			paragraphs: [
				`El ARTISTA realizó el pago único e irrepetible de: ${priceText}`,
				'Este pago no genera regalías del máster ni pagos adicionales futuros al PRODUCTOR por concepto de distribución o streaming, salvo acuerdo escrito. Lo anterior es independiente de las regalías editoriales (publishing) que correspondan al PRODUCTOR como compositor, conforme a la Cláusula III.3. El pago de la licencia no es reembolsable, salvo en los supuestos expresamente previstos en la Cláusula VIII.3 del presente contrato.',
				'En caso de chargeback, devolución o reversión del pago por cualquier motivo, la licencia se revocará automáticamente e inmediatamente, sin necesidad de notificación previa. El ARTISTA deberá cesar todo uso del beat y retirar la Nueva Canción de todas las plataformas dentro de los 5 (cinco) días hábiles siguientes a la revocación.',
				'El ARTISTA es responsable de todos los impuestos y tasas aplicables derivados de la compra de esta licencia.',
			],
		},
		{
			title: 'CLÁUSULA X. VIGENCIA Y TERMINACIÓN',
			paragraphs: [
				'La licencia entra en vigor en la fecha de pago y es indefinida a perpetuidad, siempre y cuando el ARTISTA cumpla con todos los términos aquí establecidos. Esta licencia no expira por volumen de reproducciones o distribución.',
				'El PRODUCTOR puede revocar esta licencia en caso de incumplimiento grave. La revocación implica la terminación inmediata de todos los derechos otorgados y la obligación del ARTISTA de retirar la Nueva Canción de todas las plataformas de distribución dentro de los 5 (cinco) días hábiles siguientes a la notificación de revocación, o en el plazo técnico mínimo que permita el distribuidor (DistroKid, TuneCore, etc.), lo que ocurra primero. El ARTISTA deberá acreditar documentalmente haber iniciado el proceso de retiro dentro de dicho plazo.',
			],
		},
		{
			title: 'CLÁUSULA XI. CONDICIONES GENERALES',
			paragraphs: [
				'11.1 Modificaciones: Cualquier modificación deberá constar por escrito y ser aceptada por ambas partes.',
				'11.2 Acuerdo completo: Este documento reemplaza cualquier comunicación o acuerdo previo, oral o escrito.',
				'11.3 Fuerza mayor: Ninguna de las partes será responsable por incumplimiento causado por eventos fuera de su control razonable.',
				'11.4 Confidencialidad: Los términos económicos de este acuerdo (precio pagado, descuentos aplicados y condiciones particulares) son confidenciales y no deben ser divulgados por el ARTISTA a terceros, salvo a sus asesores legales, contables, mánager o sello discográfico. Las condiciones generales de la licencia (tipo, alcance, restricciones) no son confidenciales.',
				'11.5 Notificaciones: Cualquier comunicación oficial deberá realizarse por escrito al correo electrónico provisto por cada parte. Las notificaciones enviadas al correo electrónico registrado se considerarán recibidas dentro de las 24 horas siguientes al envío. Las comunicaciones por WhatsApp u otros canales de mensajería tendrán valor informativo, pero solo las notificaciones por correo electrónico tendrán efectos legales conforme a este contrato.',
				'11.6 Protección de datos: Los datos personales recabados serán tratados conforme a la LFPDPPP de México.',
				'11.7 Definición de incumplimiento grave: Se consideran incumplimientos graves, de manera enunciativa más no limitativa: (a) la omisión del crédito obligatorio; (b) el registro no autorizado del beat o la Nueva Canción en sistemas de Content ID; (c) la venta, cesión o sublicenciamiento no autorizados; (d) el uso del beat en contenido prohibido por la Cláusula V; (e) el uso en proyectos de NFT/blockchain sin autorización expresa; (f) cualquier acto que vulnere la titularidad o los derechos de autor del PRODUCTOR sobre el beat original; (g) el uso de los stems entregados como base para producciones, remezclas o canciones distintas a la Nueva Canción acordada, o su comercialización como producción propia.',
			],
		},
		{
			title: 'CLÁUSULA XII. LEGISLACIÓN APLICABLE',
			paragraphs: [
				'Este contrato se rige por las leyes de los Estados Unidos Mexicanos, en especial la Ley Federal del Derecho de Autor (LFDA) y el Código Civil Federal. Antes de acudir a instancias judiciales, las partes acuerdan intentar resolver cualquier controversia de buena fe mediante negociación directa en un plazo de 15 (quince) días hábiles a partir de la notificación del conflicto. De no llegarse a un acuerdo, las partes se someten a la jurisdicción de los tribunales competentes de la ciudad de Puebla de Zaragoza, Estado de Puebla, México, renunciando expresamente a cualquier otro fuero que pudiera corresponderles por razón de domicilio presente o futuro. En caso de versión en inglés, la versión en español prevalece y es la legalmente vinculante.',
			],
		},
		{
			title: 'CLÁUSULA XIII. ACEPTACIÓN Y ACUERDO COMPLETO',
			paragraphs: [
				'Aceptación por pago: El pago del precio de la licencia por parte del ARTISTA constituye la manifestación inequívoca de su voluntad y su aceptación total e incondicional de todos los términos aquí expuestos, sin necesidad de firma física o digital. Para ventas de exclusivas o contratos con sellos discográficos, se recomienda firma electrónica oficial.',
				'Las partes declaran haber leído, entendido y aceptado voluntariamente todos los términos. Manifiestan que no existe dolo, error ni coacción en su celebración.',
			],
		},
	];
}

// ─── Exclusiva clauses ──────────────────────────────────────────────

function buildExclusivaClauses(priceText: string): ContractClause[] {
	return [
		{
			title: 'CLÁUSULA I. OTORGAMIENTO DE DERECHOS EXCLUSIVOS',
			paragraphs: [
				'El PRODUCTOR otorga al ARTISTA una licencia EXCLUSIVA y A PERPETUIDAD para usar el beat descrito anteriormente con el fin de grabar, reproducir, distribuir, monetizar y explotar comercialmente una o varias obras musicales (en adelante, las "Nuevas Canciones"), entendidas como composiciones musicales vocales o instrumentales que incorporen el beat licenciado. A diferencia de las licencias no exclusivas, la licencia exclusiva permite la creación de múltiples Nuevas Canciones con el mismo beat. Se considera la misma Nueva Canción: versiones, remixes, ediciones acústicas, instrumentales y ediciones de radio de una obra original. El ARTISTA tendrá el derecho exclusivo de explotar el beat, sujeto a los términos de este Contrato.',
				'1.1 Formato entregado: todos los archivos indicados en la sección Descripción del Beat (MP3, WAV, Stems/Trackout en archivo ZIP).',
				'1.2 Sincronización (TV, cine, publicidad, radio): SÍ permitida con esta licencia. El uso en sincronización queda sujeto en todo momento a las restricciones de contenido establecidas en la Cláusula VIII, quedando expresamente prohibida la sincronización en producciones que promuevan odio, discriminación, violencia, pornografía o actividades ilegales, así como en proyectos de NFT/blockchain sin autorización escrita del PRODUCTOR.',
				'1.3 Uso en presentaciones en vivo: SÍ incluido, sin límite de presentaciones ni territorios.',
				'1.4 Esta licencia NO transfiere la titularidad de los derechos de autor del beat. El PRODUCTOR conserva la propiedad intelectual de la producción original, sujeto a las condiciones de la Cláusula III.',
			],
		},
		{
			title: 'CLÁUSULA II. OBLIGACIONES DEL PRODUCTOR',
			paragraphs: [
				'Tras la recepción del pago, el PRODUCTOR se compromete a:',
				'2.1 Cese de licenciamiento: No vender, arrendar ni licenciar el beat a ningún otro tercero de ninguna manera a partir de la fecha de este contrato.',
				'2.2 Retiro del mercado: Retirar el beat de todas las tiendas en línea, mercados digitales y plataformas (BeatStars, Airbit, etc.) en un plazo máximo de 5 (cinco) días hábiles.',
				'2.3 Uso para portafolio (YouTube): El PRODUCTOR podrá mantener el beat en YouTube únicamente con fines de exposición y portafolio personal, sin ofrecerlo para venta ni licenciamiento comercial a terceros.',
			],
		},
		{
			title: 'CLÁUSULA III. DERECHOS RESERVADOS POR EL PRODUCTOR',
			paragraphs: [
				'A pesar del otorgamiento de derechos exclusivos, el PRODUCTOR se reserva expresamente:',
				'3.1 Derechos de autor de la composición: El derecho a ser reconocido como el compositor de la música. El PRODUCTOR retiene su participación del 50% de los derechos editoriales (publishing).',
				'3.2 Uso promocional: El derecho a usar el beat en su portafolio, redes sociales o página web con fines estrictamente promocionales y no comerciales, únicamente después del lanzamiento público de la primera Nueva Canción por parte del ARTISTA, o transcurridos 12 (doce) meses desde la firma de este contrato, lo que ocurra primero.',
			],
		},
		{
			title: 'CLÁUSULA IV. REGALÍAS Y PORCENTAJES',
			paragraphs: [
				'4.1 Mecanismo de distribución de regalías: Las regalías del máster se gestionarán mediante la función de split de ingresos (revenue split) del distribuidor digital utilizado por el ARTISTA (DistroKid, TuneCore, u otro equivalente). Al momento de subir la Nueva Canción a la plataforma de distribución, el ARTISTA configurará obligatoriamente el split asignando el 30% (treinta por ciento) de los ingresos brutos del máster a la cuenta del PRODUCTOR, utilizando el correo electrónico o datos de pago que el PRODUCTOR proporcione. El ARTISTA deberá enviar al PRODUCTOR una captura de pantalla de la configuración del split dentro de las 48 horas hábiles siguientes al lanzamiento, como constancia de cumplimiento.',
				'4.2 División del máster: El ARTISTA conservará el 70% (setenta por ciento) de los ingresos brutos del máster. El PRODUCTOR recibirá el 30% (treinta por ciento) directamente a través del split configurado en el distribuidor. No se requieren pagos manuales adicionales ni informes periódicos, siempre que el split esté correctamente configurado y activo.',
				'4.3 Verificación del split: Si el ARTISTA cambia de distribuidor o lanza la Nueva Canción en una plataforma adicional, deberá notificarlo al PRODUCTOR y configurar el split correspondiente en el nuevo distribuidor dentro de los 5 (cinco) días hábiles siguientes al cambio, enviando la captura de configuración como constancia. La omisión de esta notificación o la desactivación del split sin autorización escrita del PRODUCTOR constituye incumplimiento grave de este contrato.',
				'4.4 Plataformas sin split automático: Para las plataformas o distribuidores donde no sea técnicamente posible configurar el split automático del 30%, el ARTISTA realizará una transferencia manual al PRODUCTOR del 30% de los ingresos documentados, dentro de los 15 (quince) días hábiles siguientes al cierre de cada período de liquidación del distribuidor. El ARTISTA deberá conservar y compartir con el PRODUCTOR, bajo petición razonable, los estados de cuenta o reportes de ingresos correspondientes como respaldo de los pagos realizados. La omisión reiterada de estos pagos manuales constituye incumplimiento grave de este contrato.',
				'4.5 Derechos editoriales (Publishing): La división editorial será del 50% para el PRODUCTOR (Compositor) y 50% para el ARTISTA (Letrista/Autor), para ser registrado en sus respectivas Sociedades de Gestión Colectiva (SACM, BMI, ASCAP, etc.).',
			],
		},
		{
			title: 'CLÁUSULA V. RECONOCIMIENTO DE LICENCIAS ANTERIORES',
			paragraphs: [
				'El ARTISTA reconoce y acepta que el beat pudo haber sido licenciado a terceros de forma no-exclusiva antes de la fecha de este Contrato. Dichos terceros licenciatarios conservarán los derechos otorgados por sus respectivos contratos. El PRODUCTOR garantiza que no otorgará ninguna licencia adicional a partir de la fecha de este acuerdo.',
			],
		},
		{
			title: 'CLÁUSULA VI. CONTENT ID Y PROTECCIÓN DE LICENCIATARIOS ANTERIORES',
			paragraphs: [
				'6.1 Derecho de registro: El ARTISTA tendrá el derecho de registrar la Nueva Canción en sistemas de Content ID para administrar y monetizar el uso de su grabación específica.',
				'6.2 Obligación de Whitelisting: El ARTISTA se compromete a liberar (whitelist) de forma permanente cualquier reclamación de Content ID generada automáticamente contra videos publicados por licenciatarios no-exclusivos previos y contra el material promocional del propio PRODUCTOR, dentro de los 3 (tres) días hábiles siguientes a la generación de la reclamación. El incumplimiento de este plazo será considerado violación grave del presente contrato.',
				'6.3 Cooperación: El PRODUCTOR facilitará al ARTISTA, bajo petición razonable, una lista de los licenciatarios no-exclusivos conocidos. El incumplimiento del whitelisting será considerado violación grave de este Contrato.',
				'6.4 Content ID previo del PRODUCTOR: Si el beat se encuentra registrado en sistemas de Content ID a nombre del PRODUCTOR en el momento de la firma, el PRODUCTOR se compromete a retirar o transferir dicho registro al ARTISTA dentro de los 5 (cinco) días hábiles siguientes a la firma de este contrato.',
			],
		},
		{
			title: 'CLÁUSULA VII. CRÉDITOS OBLIGATORIOS',
			paragraphs: [
				'El ARTISTA se compromete a acreditar al PRODUCTOR en todos los lanzamientos y plataformas de la siguiente forma:',
				'"Prod. by Dace" o "Beat by Dace"',
				'El crédito deberá aparecer como mínimo en: (a) los metadatos de distribución digital (título del track, campo de créditos o notas del lanzamiento), y (b) la descripción o título de cualquier contenido de video (YouTube, TikTok, Instagram Reels, etc.) donde se utilicen las Nuevas Canciones.',
				'La omisión del crédito constituye una violación a este contrato y puede resultar en la revocación inmediata de la licencia sin derecho a reembolso.',
			],
		},
		{
			title: 'CLÁUSULA VIII. RESTRICCIONES Y PROHIBICIONES',
			paragraphs: [
				'8.1 Queda expresamente prohibido al ARTISTA:',
				'a) Revender, alquilar, prestar o licenciar el beat o los stems a terceros.',
				'b) Extraer, cortar o alterar elementos del beat (stems, samples, etc.) para comercializarlos como producción propia. Los stems entregados son de uso exclusivo para la mezcla y producción de las Nuevas Canciones acordadas en este contrato. Queda prohibido utilizarlos como base para otras producciones, remezclas no autorizadas o cualquier canción distinta a las acordadas.',
				'c) Usar el beat en contenido que promueva odio, discriminación, violencia, pornografía o actividades ilegales.',
				'd) Usar el beat en proyectos de NFTs, tokens o blockchain sin autorización escrita del PRODUCTOR.',
				'8.2 El incumplimiento de cualquiera de estas restricciones puede resultar en la revocación inmediata de la licencia sin reembolso.',
			],
		},
		{
			title: 'CLÁUSULA IX. GARANTÍAS E INDEMNIDAD',
			paragraphs: [
				'9.1 El PRODUCTOR garantiza que es el único autor y titular de los derechos del beat, que todos sus elementos son de su autoría o cuentan con las licencias necesarias para uso comercial, y que no infringe derechos de terceros.',
				'9.2 El ARTISTA indemnizará y mantendrá indemne al PRODUCTOR de cualquier reclamación que surja del contenido lírico o vocal añadido por el ARTISTA, o del uso indebido del beat fuera de los términos de esta licencia.',
			],
		},
		{
			title: 'CLÁUSULA X. PAGO Y CONDICIONES ECONÓMICAS',
			paragraphs: [
				`El ARTISTA realizó el pago único e irrepetible de: ${priceText}`,
				'Este pago único no cubre las regalías del máster (30% para el PRODUCTOR, según Cláusula IV). El pago de la licencia no es reembolsable.',
				'En caso de chargeback, devolución o reversión del pago por cualquier motivo, la licencia se revocará automáticamente e inmediatamente, sin necesidad de notificación previa. El ARTISTA deberá cesar todo uso del beat y retirar todas las Nuevas Canciones de todas las plataformas dentro de los 5 (cinco) días hábiles siguientes a la revocación.',
			],
		},
		{
			title: 'CLÁUSULA XI. DURACIÓN Y TERMINACIÓN',
			paragraphs: [
				'La duración de esta licencia es a perpetuidad, siempre y cuando el ARTISTA cumpla con todos los términos aquí expuestos. El PRODUCTOR puede revocar la licencia por incumplimiento grave sin derecho a reembolso. La revocación implica la terminación inmediata de TODOS los derechos otorgados y la obligación del ARTISTA de retirar todas las Nuevas Canciones que usen el beat de todas las plataformas de distribución dentro de los 5 (cinco) días hábiles siguientes a la notificación de revocación, o en el plazo técnico mínimo que permita el distribuidor (DistroKid, TuneCore, etc.), lo que ocurra primero. El ARTISTA deberá acreditar documentalmente haber iniciado el proceso de retiro dentro de dicho plazo.',
			],
		},
		{
			title: 'CLÁUSULA XII. CONDICIONES GENERALES',
			paragraphs: [
				'12.1 No reembolsable: El pago de la licencia no es reembolsable, salvo en los siguientes supuestos de incumplimiento imputable al PRODUCTOR: (a) el PRODUCTOR no retira el beat del mercado en el plazo estipulado en la Cláusula II.2; (b) el PRODUCTOR no transfiere o retira el registro de Content ID conforme a la Cláusula VI.4. En estos casos, el ARTISTA podrá solicitar la devolución proporcional del precio pagado previa notificación escrita y plazo de subsanación de 5 días hábiles.',
				'12.2 Modificaciones: Cualquier modificación deberá constar por escrito y ser aceptada por ambas partes.',
				'12.3 Fuerza mayor: Ninguna de las partes será responsable por incumplimiento causado por eventos fuera de su control razonable.',
				'12.4 Confidencialidad: Los términos económicos de este acuerdo (precio pagado, split de regalías y condiciones particulares) son confidenciales y no deben ser divulgados por el ARTISTA a terceros, salvo a sus asesores legales, contables, mánager o sello discográfico. Las condiciones generales de la licencia (tipo, alcance, restricciones) no son confidenciales.',
				'12.5 Notificaciones: Cualquier comunicación oficial deberá realizarse por escrito al correo electrónico provisto por cada parte. Las notificaciones enviadas al correo electrónico registrado se considerarán recibidas dentro de las 24 horas siguientes al envío. Las comunicaciones por WhatsApp u otros canales de mensajería tendrán valor informativo, pero solo las notificaciones por correo electrónico tendrán efectos legales conforme a este contrato.',
				'12.6 Protección de datos: Los datos personales recabados serán tratados conforme a la LFPDPPP de México.',
				'12.7 Acuerdo completo: Este documento reemplaza cualquier comunicación o acuerdo previo, oral o escrito.',
				'12.8 Definición de incumplimiento grave: Se consideran incumplimientos graves, de manera enunciativa más no limitativa: (a) omisión del crédito obligatorio; (b) registro no autorizado en sistemas de Content ID; (c) cesión, venta o sublicenciamiento del beat o stems a terceros; (d) no configurar el split del 30% en el distribuidor al momento del lanzamiento, o desactivarlo sin autorización escrita del PRODUCTOR; (e) omitir la notificación de cambio de distribuidor o plataforma adicional en el plazo establecido en la Cláusula IV.3; (f) uso del beat en contenido prohibido por la Cláusula VIII; (g) no realizar el whitelisting requerido en el plazo establecido en la Cláusula VI.2; (h) el uso de los stems entregados como base para producciones, remezclas o canciones distintas a las Nuevas Canciones acordadas, o su comercialización como producción propia; (i) la omisión reiterada de los pagos manuales del 30% establecidos en la Cláusula IV.4 para plataformas sin split automático.',
			],
		},
		{
			title: 'CLÁUSULA XIII. LEGISLACIÓN APLICABLE',
			paragraphs: [
				'Este contrato se rige por las leyes de los Estados Unidos Mexicanos, en especial la Ley Federal del Derecho de Autor (LFDA) y el Código Civil Federal. Antes de acudir a instancias judiciales, las partes acuerdan intentar resolver cualquier controversia de buena fe mediante negociación directa en un plazo de 15 (quince) días hábiles a partir de la notificación del conflicto. De no llegarse a un acuerdo, las partes se someten a la jurisdicción de los tribunales competentes de la ciudad de Puebla de Zaragoza, Estado de Puebla, México, renunciando expresamente a cualquier otro fuero que pudiera corresponderles por razón de domicilio presente o futuro. En caso de versión en inglés, la versión en español prevalece y es la legalmente vinculante.',
			],
		},
		{
			title: 'CLÁUSULA XIV. ACEPTACIÓN Y ACUERDO COMPLETO',
			paragraphs: [
				'PERFECCIONAMIENTO: Este contrato EXCLUSIVO se perfecciona con el pago del precio acordado MÁS la firma de ambas partes por cualquiera de las siguientes vías, en orden de solidez probatoria: (a) firma electrónica oficial (DocuSign, Smallpdf) o autógrafa ante notario — recomendada para montos altos o contratos con sellos discográficos; (b) firma manuscrita escaneada o fotografiada, enviada por correo electrónico o WhatsApp — válida para acreditar el acuerdo en transacciones entre particulares. El pago sin ninguna de estas formas de firma no genera la licencia exclusiva ni obliga al PRODUCTOR a retirar el beat del mercado. Una vez perfeccionado (pagado y firmado por cualquiera de las vías anteriores), el contrato es irrevocable salvo los supuestos de incumplimiento grave aquí descritos. Las partes declaran haber leído, entendido y aceptado voluntariamente todos los términos. Manifiestan que no existe dolo, error ni coacción en su celebración.',
			],
		},
	];
}

// ─── Public API ─────────────────────────────────────────────────────

export function getContractTemplate(
	contractFile: string,
	priceMXN: number,
	priceUSD: number,
): ContractTemplate {
	const priceStr = `$${priceMXN.toLocaleString()} MXN / $${priceUSD.toLocaleString()} USD`;

	switch (contractFile) {
		case '01-mp3':
			return {
				title: 'CONTRATO DE LICENCIA NO EXCLUSIVA',
				subtitle: 'DERECHOS DE USO, TÉRMINOS Y CONDICIONES — BEAT / PRODUCCIÓN MUSICAL (MP3)',
				clauses: buildNonExclusiveClauses({
					copies: 'Hasta 2,000 (dos mil) copias físicas o descargas digitales.',
					streams: 'Hasta 100,000 (cien mil) reproducciones combinadas en todas las plataformas (Spotify, Apple Music, YouTube, redes sociales, etc.).',
					priceText: `$350 MXN (para pagos dentro de México) / $19.99 USD (para pagos internacionales). La moneda aplicable será la correspondiente al método de pago seleccionado y al país del ARTISTA, según acuerdo previo entre las partes.`,
					stemsClause: '',
					stemsRestriction: 'd) Extraer, cortar o alterar elementos del beat (stems, samples, etc.) para comercializarlos como producción propia.',
				}),
			};

		case '02-wav':
			return {
				title: 'CONTRATO DE LICENCIA NO EXCLUSIVA',
				subtitle: 'DERECHOS DE USO, TÉRMINOS Y CONDICIONES — BEAT / PRODUCCIÓN MUSICAL (WAV + MP3)',
				clauses: buildNonExclusiveClauses({
					copies: 'Hasta 5,000 (cinco mil) copias físicas o descargas digitales.',
					streams: 'Hasta 500,000 (quinientas mil) reproducciones combinadas en todas las plataformas (Spotify, Apple Music, YouTube, redes sociales, etc.).',
					priceText: `$700 MXN (para pagos dentro de México) / $39.99 USD (para pagos internacionales). La moneda aplicable será la correspondiente al método de pago seleccionado y al país del ARTISTA, según acuerdo previo entre las partes.`,
					stemsClause: '',
					stemsRestriction: 'd) Extraer, cortar o alterar elementos del beat (stems, samples, etc.) para comercializarlos como producción propia.',
				}),
			};

		case '03-premium':
			return {
				title: 'CONTRATO DE LICENCIA NO EXCLUSIVA',
				subtitle: 'DERECHOS DE USO, TÉRMINOS Y CONDICIONES — BEAT / PRODUCCIÓN MUSICAL — PREMIUM (WAV + MP3 + Stems)',
				clauses: buildNonExclusiveClauses({
					copies: 'Hasta 10,000 (diez mil) copias físicas o descargas digitales.',
					streams: 'Hasta 1,000,000 (un millón) reproducciones combinadas en todas las plataformas (Spotify, Apple Music, YouTube, redes sociales, etc.).',
					priceText: `$1,400 MXN (para pagos dentro de México) / $74.99 USD (para pagos internacionales). La moneda aplicable será la correspondiente al método de pago seleccionado y al país del ARTISTA, según acuerdo previo entre las partes.`,
					stemsClause: '; (g) el uso de los stems entregados como base para producciones, remezclas o canciones distintas a la Nueva Canción acordada, o su comercialización como producción propia.',
					stemsRestriction: 'd) Extraer, cortar o alterar elementos del beat (stems, samples, etc.) para comercializarlos como producción propia. Los stems entregados son de uso exclusivo para la mezcla y producción de la Nueva Canción. Queda prohibido utilizarlos como base para otras producciones, remezclas no autorizadas o cualquier canción distinta a la acordada en este contrato.',
				}),
			};

		case '04-ilimitada':
			return {
				title: 'CONTRATO DE LICENCIA NO EXCLUSIVA',
				subtitle: 'DERECHOS DE USO, TÉRMINOS Y CONDICIONES — BEAT / PRODUCCIÓN MUSICAL — ILIMITADA (WAV + MP3 + Stems)',
				clauses: buildIlimitadaClauses(
					`$2,500 MXN (para pagos dentro de México) / $149.99 USD (para pagos internacionales). La moneda aplicable será la correspondiente al método de pago seleccionado y al país del ARTISTA, según acuerdo previo entre las partes.`,
				),
			};

		case '05-exclusiva':
			return {
				title: 'CONTRATO DE LICENCIA EXCLUSIVA',
				subtitle: 'DERECHOS DE USO, TÉRMINOS Y CONDICIONES — BEAT / PRODUCCIÓN MUSICAL — EXCLUSIVA',
				clauses: buildExclusivaClauses(
					priceMXN > 0
						? `${priceStr} (cantidad acordada entre las partes y confirmada por comprobante de pago adjunto o enviado por mensaje)`
						: 'Cantidad negociada entre las partes',
				),
			};

		default:
			return getContractTemplate('01-mp3', priceMXN, priceUSD);
	}
}
