class RequestPathLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        print("=" * 50)
        print(">>> DIAGNOSTIC MIDDLEWARE <<<")
        print(f"    Host: {request.get_host()}")
        print(f"    Path: {request.path}")
        print(f"    Path Info: {request.path_info}")
        print(f"    META['PATH_INFO']: {request.META.get('PATH_INFO')}")
        print(f"    META['SCRIPT_NAME']: {request.META.get('SCRIPT_NAME')}")
        print("=" * 50)
        
        response = self.get_response(request)
        
        return response
