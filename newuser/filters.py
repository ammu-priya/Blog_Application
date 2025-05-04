from django_filters import rest_framework as filters
from .models import Post

class PostFilter(filters.FilterSet):
    author = filters.CharFilter(field_name='author__username', lookup_expr='iexact')
    tag = filters.CharFilter(field_name='tags__name', lookup_expr='iexact')
    is_published = filters.BooleanFilter(field_name='is_published')

    class Meta:
        model = Post
        fields = ['author', 'tag', 'is_published']
