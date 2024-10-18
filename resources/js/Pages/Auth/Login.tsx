import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });
    const [posts, setPosts] = useState<Post[]>([]);
    const [count, setCount] = useState(0);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    interface Post {
        id: number;
        title: string;
    }



    useEffect(() => {
        fetch('https://jsonplaceholder.typicode.com/posts')
            .then(response => response.json())
            .then(data => setPosts(data))
            .catch(error => console.error('Error:', error));
    }, []);

    // Función para manejar la petición a la API y actualizar el contador
    const handleIncrement = () => {
        fetch('/increment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement).content
            }
        })
        .then(response => response.json())
        .then(data => setCount(data.count))
        .catch(error => console.error('Error:', error));
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                {/* El formulario de inicio de sesión */}
            </form>

            <h1 className="text-2xl font-bold mt-8">Login</h1>

            <ul>
                {posts.map((post) => (
                    <li key={post.id}>{post.title}</li>
                ))}
            </ul>

            {/* Sección para el contador */}
            <div className="mt-8">
                <h2 className="text-xl font-bold">Count: {count}</h2>
                <PrimaryButton onClick={handleIncrement}>
                    Increment Count
                </PrimaryButton>
            </div>
        </GuestLayout>
    );
}
