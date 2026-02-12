from pydantic import BaseModel


class VendorBase(BaseModel):
    name: str
    category: str | None = None
    vendor_type: str | None = None
    status: str | None = None
    criticality: str | None = None
    service_level: str | None = None
    contract_value: float | None = None
    contract_end: str | None = None
    contact_person: str | None = None
    vendor_manager: str | None = None
    website: str | None = None
    rating: int | None = None
    description: str | None = None


class VendorCreate(VendorBase):
    id: str | None = None


class VendorRead(VendorBase):
    id: str

    model_config = {"from_attributes": True}


class VendorUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    vendor_type: str | None = None
    status: str | None = None
    criticality: str | None = None
    service_level: str | None = None
    contract_value: float | None = None
    contract_end: str | None = None
    contact_person: str | None = None
    vendor_manager: str | None = None
    website: str | None = None
    rating: int | None = None
    description: str | None = None
