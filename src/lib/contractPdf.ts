/**
 * Contract PDF generator — re-exports from the full contract generator.
 * This file maintains backward compatibility with existing imports.
 */

export {
	type ContractData,
	getContractFile,
	generateContractPDF,
	generateContractPDFBase64,
} from './contractGenerator';
