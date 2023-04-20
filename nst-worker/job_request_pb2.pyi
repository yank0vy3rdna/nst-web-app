from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

CONTENT: ImageType
DESCRIPTOR: _descriptor.FileDescriptor
STYLE: ImageType

class GiveJobRequest(_message.Message):
    __slots__ = ["workerId"]
    WORKERID_FIELD_NUMBER: _ClassVar[int]
    workerId: str
    def __init__(self, workerId: _Optional[str] = ...) -> None: ...

class GiveJobResponse(_message.Message):
    __slots__ = ["imageChunk", "imageType", "jobGiven", "requestId", "workerId"]
    IMAGECHUNK_FIELD_NUMBER: _ClassVar[int]
    IMAGETYPE_FIELD_NUMBER: _ClassVar[int]
    JOBGIVEN_FIELD_NUMBER: _ClassVar[int]
    REQUESTID_FIELD_NUMBER: _ClassVar[int]
    WORKERID_FIELD_NUMBER: _ClassVar[int]
    imageChunk: bytes
    imageType: ImageType
    jobGiven: bool
    requestId: str
    workerId: str
    def __init__(self, imageChunk: _Optional[bytes] = ..., imageType: _Optional[_Union[ImageType, str]] = ..., requestId: _Optional[str] = ..., workerId: _Optional[str] = ..., jobGiven: bool = ...) -> None: ...

class JobEndRequest(_message.Message):
    __slots__ = ["imageChunk", "requestId", "workerId"]
    IMAGECHUNK_FIELD_NUMBER: _ClassVar[int]
    REQUESTID_FIELD_NUMBER: _ClassVar[int]
    WORKERID_FIELD_NUMBER: _ClassVar[int]
    imageChunk: bytes
    requestId: str
    workerId: str
    def __init__(self, imageChunk: _Optional[bytes] = ..., requestId: _Optional[str] = ..., workerId: _Optional[str] = ...) -> None: ...

class JobProgressData(_message.Message):
    __slots__ = ["progressPercent", "requestId", "workerId"]
    PROGRESSPERCENT_FIELD_NUMBER: _ClassVar[int]
    REQUESTID_FIELD_NUMBER: _ClassVar[int]
    WORKERID_FIELD_NUMBER: _ClassVar[int]
    progressPercent: float
    requestId: str
    workerId: str
    def __init__(self, workerId: _Optional[str] = ..., requestId: _Optional[str] = ..., progressPercent: _Optional[float] = ...) -> None: ...

class Ok(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class ImageType(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []
