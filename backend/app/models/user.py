from sqlalchemy import Column, Integer, String, Float
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String, nullable=False)

    email = Column(String, unique=True, nullable=False, index=True)

    hashed_password = Column(String, nullable=False)

    cgpa = Column(Float)

    branch = Column(String)

    semester = Column(Integer)

    college = Column(String)

    placement_target = Column(String)

    weak_subjects = Column(String)

    available_study_hours = Column(Integer)