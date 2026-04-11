You are a senior full-stack engineer working inside an existing production-ready codebase for a project called “LandChain”.

Your task is to EXTEND the existing “Register Property” feature by adding new functionality WITHOUT breaking or redesigning the current UI, structure, or styling.

⸻

⚠️ STRICT CONSTRAINTS
	•	DO NOT redesign the UI
	•	DO NOT change existing layout, styling system, or component hierarchy
	•	DO NOT rename existing components unless absolutely necessary
	•	DO NOT remove existing functionality
	•	Reuse existing UI components (inputs, buttons, dropdowns, upload components)
	•	Follow the current styling approach (Tailwind / CSS modules / etc.)
	•	Maintain visual consistency with the rest of the app

Only ADD or EXTEND functionality.

⸻

🎯 OBJECTIVE

Enhance the existing “Register Property” page with additional fields, uploads, and backend integrations.

⸻

🧩 FRONTEND CHANGES (MINIMAL + CONSISTENT)

Locate the existing Register Property component.

1. Address → Geocoding
	•	Reuse existing address input (or add one if missing)
	•	On blur or button click:
	•	Call backend: POST /geocode
	•	Store and display:
	•	latitude
	•	longitude

Do not change layout—add fields inline or below existing address field.

⸻

2. Add Property Fields (use existing input styles)

Add the following fields using the SAME UI components already used in the form:
	•	State (dropdown)
	•	District (input or dropdown)
	•	Property Type (dropdown):
	•	Residential
	•	Commercial
	•	Industrial
	•	Agricultural
	•	BHK / Rooms (numeric)
	•	Only enabled if type = Residential
	•	Area (numeric)
	•	Unit (dropdown):
	•	sqft
	•	sqyd
	•	acre
	•	hectare
	•	kanal
	•	bigha

⸻

3. Add Additional Metadata Fields
	•	Property Status:
	•	Under Construction
	•	Ready to Move
	•	Old Property
	•	Ownership Type:
	•	Freehold
	•	Leasehold
	•	Joint Ownership

⸻

4. Document Upload Section (extend existing upload system if present)

Add 3 upload fields:
	•	Sale Deed (required)
	•	Encumbrance Certificate (EC)
	•	Khata / Land Record

Constraints:
	•	Use existing upload component if available
	•	Maintain same styling and layout pattern
	•	Show upload state (loading/success)
	•	Store returned IPFS hash

⸻

5. Property Image Upload
	•	Add multiple image upload support
	•	Use same upload UI style as documents
	•	Show preview thumbnails if existing system supports it

⸻

6. Validation (extend existing validation logic)
	•	Sale Deed must be required
	•	BHK only allowed for Residential
	•	Area must be > 0
	•	Prevent submission if geocoding not completed

⸻

⚙️ BACKEND CHANGES (EXTEND, DO NOT BREAK)

⸻

1. Add Geocoding Route

POST /geocode
	•	Use OpenStreetMap Nominatim API
	•	Input: address
	•	Output: lat, lng

⸻

2. Extend Upload System

If upload system exists:
	•	Extend it to support:
	•	PDF documents
	•	Multiple images

Otherwise:
	•	Implement multer-based upload
	•	Upload files to IPFS (Pinata)

⸻

3. Extend Property Registration API

Modify existing /register-property endpoint to accept:

{
address,
lat,
lng,
state,
district,
propertyType,
bhk,
area,
unit,
propertyStatus,
ownershipType,
documents: {
saleDeed,
ec,
khata
},
images: []
}

Ensure backward compatibility with existing fields.

⸻

🧾 METADATA GENERATION

Extend existing metadata generator (do not replace it).

Ensure new fields are included:
	•	location (address, state, district, lat, lng)
	•	details (type, bhk, area, unit, status, ownership)
	•	documents (sale deed, EC, khata)
	•	images

⸻

🔗 BLOCKCHAIN INTEGRATION

Do NOT modify existing contract logic.

Only ensure:
	•	metadata is uploaded to IPFS
	•	submitProperty(metadataHash) is called correctly

⸻

🗄️ DATABASE

Extend schema without breaking existing data:

Add nullable fields if needed:
	•	state
	•	district
	•	property_type
	•	bhk
	•	unit
	•	property_status
	•	ownership_type
	•	lat
	•	lng

⸻

🔒 SAFETY
	•	Do not break existing APIs
	•	Ensure all new fields are optional-safe for old data
	•	Add validation but do not block legacy flows

⸻

📦 OUTPUT
	1.	Modified frontend component (minimal diff)
	2.	Updated backend routes (non-breaking)
	3.	Upload handling logic (if extended)
	4.	Updated metadata generator
	5.	Notes explaining what was added vs reused

Focus on minimal, safe, incremental changes.
:::
