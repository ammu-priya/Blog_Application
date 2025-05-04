from rest_framework import serializers
from .models import *

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']
class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'post', 'user', 'content', 'created_at', 'parent', 'replies', 'is_deleted']
        read_only_fields = ['user', 'created_at', 'is_deleted']

    def get_replies(self, obj):
        
        replies = Comment.objects.filter(parent=obj, is_deleted=False)
        
        return CommentSerializer(replies, many=True).data

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    tags = TagSerializer(many=True,required=False)
    comments = CommentSerializer(many=True, read_only=True)
    likes_count = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'author', 'created_at', 'updated_at', 'is_published', 'is_deleted', 'tags', 'comments', 'likes_count']
        read_only_fields = ['author', 'created_at', 'updated_at', 'is_deleted', 'comments', 'likes_count']

    def get_likes_count(self, obj):
        return obj.likes.count()

    def validate(self, data):
        required_fields = ['title', 'content']
        missing = [field for field in required_fields if not data.get(field)]
        if missing:
            raise Exception(
                f"Missing required field(s): {', '.join(missing)}"
            )
        return data

    def create(self, validated_data):
        post = Post.objects.create(**validated_data)
        return post
class PostUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'author', 'created_at', 'updated_at', 'is_published', 'is_deleted', 'tags', 'comments', 'likes_count']
        read_only_fields = ['author', 'created_at', 'updated_at', 'is_deleted', 'comments', 'likes_count']

    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags', None)
        
        if tags_data:
            instance.tags.clear()
            for tag_data in tags_data:
                tag, _ = Tag.objects.get_or_create(name=tag_data['name'])
                instance.tags.add(tag)
        instance.save()
        return instance


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class PublicPostSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    likes_count = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'author', 'tags', 'likes_count', 'created_at', 'updated_at']

    def get_likes_count(self, obj):
        return obj.likes.count()


    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(obj.replies.filter(is_deleted=False), many=True).data
        return []



class LikeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    post = serializers.PrimaryKeyRelatedField(queryset=Post.objects.all())

    class Meta:
        model = Like
        fields = ['id', 'user', 'post', 'created_at']
        read_only_fields = ['user', 'created_at']