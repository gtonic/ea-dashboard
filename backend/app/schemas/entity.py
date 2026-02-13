from pydantic import BaseModel


class LegalEntityBase(BaseModel):
    name: str
    short_name: str | None = None
    description: str | None = None
    country: str | None = None
    city: str | None = None
    region: str | None = None
    parent_entity: str | None = None


class LegalEntityCreate(LegalEntityBase):
    id: str | None = None


class LegalEntityRead(LegalEntityBase):
    id: str

    model_config = {"from_attributes": True}


class LegalEntityUpdate(BaseModel):
    name: str | None = None
    short_name: str | None = None
    description: str | None = None
    country: str | None = None
    city: str | None = None
    region: str | None = None
    parent_entity: str | None = None
