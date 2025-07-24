from rest_framework.exceptions import AuthenticationFailed
from rest_framework.views import exception_handler, APIView
from ..views import MyTokenObtainPairView



def custom_exception_handler(exc, context):
    # Call REST framework's default exception handler first,
    # to get the standard error response.
    response = exception_handler(exc, context)
    #print(context['request'].data)

    # Now add the HTTP status code to the response.
    view = context.get('view', None)

    if response is not None:
        response.data['status_code'] = response.status_code
        #print(isinstance(exc, AuthenticationFailed))
        if response.status_code == 401 and isinstance(exc, AuthenticationFailed):
            response.data['detail'] = str(exc.detail)



    return response