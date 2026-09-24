class AppError(Exception):
    """An expected failure with a stable machine-readable code, returned as JSON by the API."""

    def __init__(self, code, message=None, status=400):
        super().__init__(message or code)
        self.code = code
        self.message = message or code
        self.status = status
